import { deepSortObject } from './deep-sort-object'
import { Model } from './model'
import { Schema } from './schema'

export class Lib {
  public static _schemas: Map<string, Schema> = new Map()

  public static newHash(name: string, _struct: any) {
    // https://stackoverflow.com/a/7616484/12656855
    const strToHash = (s: string) => {
      let hash = 0

      for (let i = 0; i < s.length; i++) {
        const chr = s.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
      }
      hash *= 254785 // times a random number
      return Math.abs(hash).toString(32).slice(2, 6)
    }

    let hash = strToHash(JSON.stringify(_struct) + name)
    if (hash.length !== 4) throw new Error('Hash has not length of 4')
    return `#${hash}`
  }

  public static schema(name: string, _struct: object) {
    _struct = deepSortObject(_struct as any)
    const id = Lib.newHash(name, _struct)
    const s = new Schema(id, name, _struct)
    this._schemas.set(id, s)
    return s
  }

  public static getIdFromBuffer = (buffer: ArrayBuffer) => {
    const dataView = new DataView(buffer)
    let id = ''

    for (let i = 0; i < 5; i++) {
      const uInt8 = dataView.getUint8(i)
      id += String.fromCharCode(uInt8)
    }

    return id
  }

  public static getIdFromSchema = (schema: Schema) => schema.id

  public static getIdFromModel = (model: Model) => model.schema.id
}
