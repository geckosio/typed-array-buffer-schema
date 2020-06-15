const { BufferSchema, Model, uint8, int16, uint16 } = require('../lib/index.js')

describe('special types test', () => {
  const playerSchema = BufferSchema.schema('player', {
    id: uint8,
    x: { type: uint16, digits: 4 }
  })

  const PlayerModel = new Model(playerSchema)

  const state = { id: 0, x: 5.211427545 }

  test('should be able to manage and crop digits', () => {
    const buffer = PlayerModel.toBuffer(state)
    const data = PlayerModel.fromBuffer(buffer)

    expect(data.x).toBe(5.2114)
  })
})
