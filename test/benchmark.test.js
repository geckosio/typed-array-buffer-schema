const { BufferSchema, Model, uint8, int8, int16, uint16 } = require('../lib/index.js')

describe('simple test', () => {
  const playerSchema = BufferSchema.schema('player', {
    id: int8,
    x: int16,
    y: int16
  })

  const snapshotSchema = BufferSchema.schema('snapshot', {
    time: uint16,
    data: {
      players: [playerSchema]
    }
  })

  const SnapshotModel = new Model(snapshotSchema)

  const snap = {
    time: 1234,
    data: {
      players: [
        { id: 0, x: 22, y: 38 },
        { id: 1, x: -54, y: 7 }
      ]
    }
  }

  let buffer
  let data = snap

  test('should convert as many time as possible', () => {
    const hrstart = process.hrtime()

    for (let i = 0; i < 100; i++) {
      buffer = SnapshotModel.toBuffer(data)
      data = SnapshotModel.fromBuffer(buffer)
    }

    const hrend = process.hrtime(hrstart)

    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)

    const dataL = JSON.stringify(data).length
    const snapL = JSON.stringify(snap).length

    expect(dataL).toBe(snapL)
  })
})
