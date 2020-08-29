const { BufferSchema, Model, uint8, int16, uint16 } = require('../lib/index.js')

describe('simple test', () => {
  const castleSchema = BufferSchema.schema('castle', {
    id: uint8,
    health: uint8
  })

  const playerSchema = BufferSchema.schema('player', {
    id: uint8,
    // x: { type: int16, digits: 2 },
    // y: { type: int16, digits: 2 },
    x: int16,
    y: int16
  })

  const snapshotSchema = BufferSchema.schema('snapshot', {
    time: uint16,
    numbers: { single: uint8, list: [uint8] },
    data: { players: [playerSchema], castles: [castleSchema] }
  })

  const SnapshotModel = new Model(snapshotSchema)

  const snap = {
    time: 1234,
    numbers: {
      single: 0,
      list: [1]
    },
    data: {
      castles: [{ id: 2, health: 81 }],
      players: [
        {
          id: 14,
          x: 145,
          y: 98
        },
        {
          id: 15,
          x: 218,
          y: -14
        }
      ]
    }
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
    expect(uint8.buffer.byteLength).toBe(31)
  })

  test('should fromBuffer', () => {
    data = SnapshotModel.fromBuffer(buffer)
    expect(data.time).toBe(1234)
    expect(data.data.players[0].x).toBe(145)
    expect(data.numbers.single).toBe(0)
    expect(data.numbers.list[0]).toBe(1)
  })

  test('stringified version should have same length', () => {
    expect(JSON.stringify(snap).length).toBe(JSON.stringify(data).length)
  })
})
