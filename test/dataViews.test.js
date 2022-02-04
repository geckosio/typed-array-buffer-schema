const {
  BufferSchema,
  Model,
  int8,
  uint8,
  int16,
  uint16,
  int32,
  uint32,
  int64,
  uint64,
  float32,
  float64,
  string8,
  string16,
  bool8,
  bool16
} = require('../lib/index.js')

describe('dataViews test', () => {
  const playerSchema = BufferSchema.schema('player', {
    a: int8,
    b: uint8,
    c: int16,
    d: uint16,
    e: int32,
    f: uint32,
    g: int64,
    h: uint64,
    i: float32,
    j: float64,
    k: string8,
    kk: { type: string8, length: 24 },
    l: string16,
    m: bool8,
    n: bool16
  })

  const snapshotSchema = BufferSchema.schema('snapshot', {
    players: [playerSchema]
  })

  const SnapshotModel = new Model(snapshotSchema)

  const now = new Date().getTime()

  const snap = {
    players: [
      {
        a: 10,
        b: 10,
        c: 50,
        d: 50,
        e: 100,
        f: 100,
        g: now,
        h: now,
        i: 1.123456,
        j: 1.123456789,
        k: 'This line is too long.',
        kk: 'This line is too long.',
        l: 'Эта строка слишком длинная.',
        m: [true, false, false],
        n: [true, true, false, true, true, true, false, false, false, true]
      }
    ]
  }

  let buffer
  let data = snap

  test('should convert successfully', () => {
    buffer = SnapshotModel.toBuffer(data)
    data = SnapshotModel.fromBuffer(buffer)

    expect(data.players[0].m[2]).toBe(false)
    expect(data.players[0].n[7]).toBe(false)
    expect(data.players[0].g).toBe(now)
    expect(data.players[0].h).toBe(now)
    expect(data.players[0].k).toBe('This line is')
    expect(data.players[0].kk.trim()).toBe('This line is too long.')
    expect(data.players[0].l).toBe('Эта строка с')
  })
})
