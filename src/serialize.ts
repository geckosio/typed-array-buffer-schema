import { Schema } from './schema'
import { Lib } from './lib'
import set from 'lodash/set'
import { deepSortObject } from './deep-sort-object'

export class Serialize {
  protected _buffer: ArrayBuffer = new ArrayBuffer(0)
  protected _dataView: DataView = new DataView(this._buffer)
  protected _bytes: number = 0

  constructor(protected schema: Schema) {}

  public refresh() {
    this._buffer = new ArrayBuffer(8 * 1024)
    this._dataView = new DataView(this._buffer)
    this._bytes = 0
  }

  private cropString(str: string, length: number) {
    return str.padEnd(length, ' ').slice(0, length)
  }

  private isSpecialType(prop: object) {
    let propKeys = Object.keys(prop).filter(k => k != "type" && k != "digits" && k != "length")

    return !propKeys.length
  }

  public flatten(schema: any, data: any) {
    let flat: any[] = []

    // https://stackoverflow.com/a/15589677/12656855
    const flatten = (schema: any, data: any) => {
      // add the schema id to flat[] (its a String8 with 5 characters, the first char is #)
      if (schema?._id) flat.push({ d: schema._id, t: 'String8' })
      else if (schema?.[0]?._id) flat.push({ d: schema[0]._id, t: 'String8' })

      // if it is a schema
      if (schema?._struct) schema = schema._struct
      // if it is a schema[]
      else if (schema?.[0]?._struct) schema = schema[0]._struct

      // console.log('-------')
      // console.log('data', typeof data, data)

      for (let property in data) {
        if (data.hasOwnProperty(property)) {
          if (typeof data[property] === 'object') {
            // if data is array, but schemas is flat, use index 0 on the next iteration
            if (Array.isArray(data)) flatten(schema, data[parseInt(property)])
            else flatten(schema[property], data[property])
          }
          //---
          else {
            // handle specialTypes e.g.:  "x: { type: int16, digits: 2 }"
            if (schema[property]?.type?._type && this.isSpecialType(schema[property])) {
              if (schema[property]?.digits) {
                data[property] *= Math.pow(10, schema[property].digits)
                data[property] = parseInt(data[property].toFixed(0))
              }
              if (schema[property]?.length) {
                const length = schema[property]?.length
                data[property] = this.cropString(data[property], length)
              }
              flat.push({ d: data[property], t: schema[property].type._type })
            } else {
              // crop strings to default length of 12 characters if nothing else is specified
              if (schema[property]._type === 'String8' || schema[property]._type === 'String16') {
                data[property] = this.cropString(data[property], 12)
              }
              flat.push({ d: data[property], t: schema[property]._type })
            }
          }
        } else {
        }
      }
    }

    flatten(schema, data)

    return flat
  }

  public toBuffer(state: any) {
    let worldState = deepSortObject(state)

    // deep clone the worldState
    const data = JSON.parse(JSON.stringify(worldState))

    this.refresh()

    const flat = this.flatten(this.schema, data)

    // to buffer
    flat.forEach((f: any, i: number) => {
      if (f.t === 'String8') {
        for (let j = 0; j < f.d.length; j++) {
          this._dataView.setUint8(this._bytes, f.d[j].charCodeAt(0))
          this._bytes++
        }
      } else if (f.t === 'String16') {
        for (let j = 0; j < f.d.length; j++) {
          this._dataView.setUint16(this._bytes, f.d[j].charCodeAt(0))
          this._bytes += 2
        }
      } else if (f.t === 'Int8Array') {
        this._dataView.setInt8(this._bytes, f.d)
        this._bytes++
      } else if (f.t === 'Uint8Array') {
        this._dataView.setUint8(this._bytes, f.d)
        this._bytes++
      } else if (f.t === 'Int16Array') {
        this._dataView.setInt16(this._bytes, f.d)
        this._bytes += 2
      } else if (f.t === 'Uint16Array') {
        this._dataView.setUint16(this._bytes, f.d)
        this._bytes += 2
      } else if (f.t === 'Int32Array') {
        this._dataView.setInt32(this._bytes, f.d)
        this._bytes += 4
      } else if (f.t === 'Uint32Array') {
        this._dataView.setUint32(this._bytes, f.d)
        this._bytes += 4
      } else if (f.t === 'BigInt64Array') {
        this._dataView.setBigInt64(this._bytes, BigInt(f.d))
        this._bytes += 8
      } else if (f.t === 'BigUint64Array') {
        this._dataView.setBigUint64(this._bytes, BigInt(f.d))
        this._bytes += 8
      } else if (f.t === 'Float32Array') {
        this._dataView.setFloat32(this._bytes, f.d)
        this._bytes += 4
      } else if (f.t === 'Float64Array') {
        this._dataView.setFloat64(this._bytes, f.d)
        this._bytes += 8
      } else {
        console.log('ERROR: Something unexpected happened!')
      }
    })

    const newBuffer = new ArrayBuffer(this._bytes)
    const view = new DataView(newBuffer)

    // copy all data to a new (resized) ArrayBuffer
    for (let i = 0; i < this._bytes; i++) {
      view.setUint8(i, this._dataView.getUint8(i))
    }

    return newBuffer
  }

  public fromBuffer(buffer: ArrayBuffer) {
    // 35 is #

    // check where, in the buffer, the schemas are
    let index = 0
    let indexes: number[] = []

    const view = new DataView(buffer)
    const int8 = Array.from(new Int8Array(buffer))

    while (index > -1) {
      index = int8.indexOf(35, index)
      if (index !== -1) {
        indexes.push(index)
        index++
      }
    }

    // get the schema ids
    let schemaIds: string[] = []
    indexes.forEach(index => {
      let id = ''
      for (let i = 0; i < 5; i++) {
        let char = String.fromCharCode(int8[index + i])
        id += char
      }
      schemaIds.push(id)
    })

    // assemble all info about the schemas we need
    let schemas: { id: string; schema: any; startsAt: number }[] = []
    schemaIds.forEach((id, i) => {
      // check if the schemaId exists
      // (this can be, for example, if charCode 35 is not really a #)
      const schemaId = Lib._schemas.get(id)
      if (schemaId) schemas.push({ id, schema: Lib._schemas.get(id), startsAt: indexes[i] + 5 })
    })
    // schemas[] contains now all the schemas we need to fromBuffer the bufferArray

    // lets begin the serialization
    let data: any = {} // holds all the data we want to give back
    let bytes: number = 0 // the current bytes of arrayBuffer iteration
    let dataPerSchema: any = {}

    const deserializeSchema = (struct: any) => {
      let data = {}
      if (typeof struct === 'object') {
        for (let property in struct) {
          if (struct.hasOwnProperty(property)) {
            const prop = struct[property]

            // handle specialTypes e.g.:  "x: { type: int16, digits: 2 }"
            let specialTypes
            if (prop?.type?._type && prop?.type?._bytes && this.isSpecialType(prop)) {
              specialTypes = prop
              prop._type = prop.type._type
              prop._bytes = prop.type._bytes
            }

            if (prop && prop['_type'] && prop['_bytes']) {
              const _type = prop['_type']
              const _bytes = prop['_bytes']
              let value

              if (_type === 'String8') {
                value = ''
                const length = prop.length || 12
                for (let i = 0; i < length; i++) {
                  const char = String.fromCharCode(view.getUint8(bytes))
                  value += char
                  bytes++
                }
              }
              if (_type === 'String16') {
                value = ''
                const length = prop.length || 12
                for (let i = 0; i < length; i++) {
                  const char = String.fromCharCode(view.getUint16(bytes))
                  value += char
                  bytes += 2
                }
              }
              if (_type === 'Int8Array') {
                value = view.getInt8(bytes)
                bytes += _bytes
              }
              if (_type === 'Uint8Array') {
                value = view.getUint8(bytes)
                bytes += _bytes
              }
              if (_type === 'Int16Array') {
                value = view.getInt16(bytes)
                bytes += _bytes
              }
              if (_type === 'Uint16Array') {
                value = view.getUint16(bytes)
                bytes += _bytes
              }
              if (_type === 'Int32Array') {
                value = view.getInt32(bytes)
                bytes += _bytes
              }
              if (_type === 'Uint32Array') {
                value = view.getUint32(bytes)
                bytes += _bytes
              }
              if (_type === 'BigInt64Array') {
                value = parseInt(view.getBigInt64(bytes).toString())
                bytes += _bytes
              }
              if (_type === 'BigUint64Array') {
                value = parseInt(view.getBigUint64(bytes).toString())
                bytes += _bytes
              }
              if (_type === 'Float32Array') {
                value = view.getFloat32(bytes)
                bytes += _bytes
              }
              if (_type === 'Float64Array') {
                value = view.getFloat64(bytes)
                bytes += _bytes
              }

              // apply special types options
              if (typeof value === 'number' && specialTypes?.digits) {
                value *= Math.pow(10, -specialTypes.digits)
                value = parseFloat(value.toFixed(specialTypes.digits))
              }

              data = { ...data, [property]: value }
            }
          }
        }
      }
      return data
    }

    schemas.forEach((s, i) => {
      let struct = s.schema?.struct
      let start = s.startsAt
      let end = buffer.byteLength
      let id = s.schema?.id || 'XX'

      if (id === 'XX') console.error('ERROR: Something went horribly wrong!')

      try {
        end = schemas[i + 1].startsAt - 5
      } catch {}

      // TOOD(yandeu) bytes is not accurate since it includes child schemas
      const length = s.schema?.bytes || 1
      // determine how many iteration we have to make in this schema
      // the players array maybe contains 5 player, so we have to make 5 iterations
      const iterations = (end - start) / length

      for (let i = 0; i < iterations; i++) {
        bytes = start + i * length
        // gets the data from this schema
        let schemaData = deserializeSchema(struct)

        if (iterations <= 1) dataPerSchema[id] = { ...schemaData }
        else {
          if (typeof dataPerSchema[id] === 'undefined') dataPerSchema[id] = []
          dataPerSchema[id].push(schemaData)
        }
      }
    })

    // add dataPerScheme to data
    data = {}

    const populateData = (obj: any, key: any, value: any, path: string = '', isArray = false) => {
      if (obj && obj._id && obj._id === key) {
        let p = path.replace(/_struct\./, '').replace(/\.$/, '')
        // if it is a schema[], but only has one set, we manually have to make sure it transforms to an array
        if (isArray && !Array.isArray(value)) value = [value]
        // '' is the top level
        if (p === '') data = { ...data, ...value }
        else set(data, p, value)
      } else {
        for (const props in obj) {
          if (obj.hasOwnProperty(props)) {
            if (typeof obj[props] === 'object') {
              let p = Array.isArray(obj) ? '' : `${props}.`
              populateData(obj[props], key, value, path + p, Array.isArray(obj))
            }
            //obj
          }
        }
      }
    }

    // to it backwards (don't remember why this is needed, but it works without it)
    // for (let i = Object.keys(dataPerSchema).length - 1; i >= 0; i--) {
    //   const key = Object.keys(dataPerSchema)[i]
    //   const value = dataPerSchema[key]
    //   populateData(this.schema, key, value, '')
    // }

    for (let i = 0; i < Object.keys(dataPerSchema).length; i++) {
      const key = Object.keys(dataPerSchema)[i]
      const value = dataPerSchema[key]
      populateData(this.schema, key, value, '')
    }

    return data
  }
}
