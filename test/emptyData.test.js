const { BufferSchema, Model, uint8, int16, uint16 } = require('../lib/index.js')

describe('simple test', () => {
  const playerSchema = BufferSchema.schema('player', {
    id: uint8
  })

  const botSchema = BufferSchema.schema('bot', {
    id: uint8
  })

  const carSchema = BufferSchema.schema('car', {
    id: uint8
  })

  const snapshotSchema = BufferSchema.schema('snapshot', {
    time: uint16,
    data: {
      emptyArr: [playerSchema],
      emptyObj: botSchema,
      superCar: carSchema
    }
  })

  const SnapshotModel = new Model(snapshotSchema)

  const snap = {
    data: {
      emptyArr: [],
      emptyObj: {},
      superCar: {
        id: 911
      }
    }
  }

  test('empty arrays and empty object are omitted', () => {
    const buffer = SnapshotModel.toBuffer(snap)

    const dataL = JSON.stringify(SnapshotModel.fromBuffer(buffer)).length
    const snapL = JSON.stringify(snap).length
    const emptiesL = '"emptyArr":[],"emptyObj":{},'.length

    expect(dataL).toBe(snapL - emptiesL)
  })
})
