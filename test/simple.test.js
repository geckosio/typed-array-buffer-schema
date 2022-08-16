const { BufferSchema, Model, uint8, int16, uint16, string8, bool8 } = require('../lib/index.js')
const _ = require('underscore')

describe('simple test', () => {
  const castleSchema = BufferSchema.schema('castle', {
    id: uint8,
    type: { type: string8, length: 3 },
    health: uint8
  })

  const playerSchema = BufferSchema.schema('player', {
    id: uint8,
    a: { type: int16, digits: 1 },
    b: { type: int16, digits: 1 },
    x: int16,
    y: int16
  })

  const listSchema = BufferSchema.schema('list', {
    value: uint8
  })

  const snapshotSchema = BufferSchema.schema('snapshot', {
    time: uint16,
    single: uint8,
    data: { list: [listSchema], players: [playerSchema], castles: [castleSchema] },
    serverConfig: bool8
  })

  const SnapshotModel = new Model(snapshotSchema)

  const snap = {
    time: 1234,
    single: 0,
    data: {
      list: [{ value: 1 }, { value: 2 }],
      castles: [
        {
          id: 2,
          type: 'big',
          health: 81
        }
      ],
      players: [
        {
          id: 14,
          a: 10,
          b: 5,
          x: 145,
          y: 98
        },
        {
          id: 15,
          a: 7,
          b: -55,
          x: 218,
          y: -14
        }
      ]
    },
    serverConfig: [true, false, true, false, false]
  }

  let buffer
  let data

  test('get schema name', () => {
    expect(castleSchema.name).toBe('castle')
  })

  test('should return a buffer', () => {
    buffer = SnapshotModel.toBuffer(snap)
    const uint8 = new Uint8Array(buffer)

    expect(typeof buffer).toBe('object')
    expect(uint8.buffer.byteLength).toBe(49)
  })

  test('should fromBuffer', () => {
    data = SnapshotModel.fromBuffer(buffer)

    expect(data.time).toBe(1234)
    expect(data.data.players[0].x).toBe(145)
    expect(data.data.players[0].a).toBe(10)
    expect(data.data.players[1].b).toBe(-55)
  })

  test('stringified version should have same length', () => {
    expect(_.isEqual(snap, data)).toBeTruthy()
  })
})
