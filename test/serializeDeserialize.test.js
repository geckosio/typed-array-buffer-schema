const { BufferSchema, Model, uint8, uint32, string8, int16 } = require('../lib/index.js')

// see: https://github.com/geckosio/typed-array-buffer-schema/issues/7
describe('serialize deserialize', () => {
  const movementSchema = BufferSchema.schema('movement', {
    sequenceNumber: uint32,
    horizontal: uint8,
    vertical: uint8
  })
  const movementModel = new Model(movementSchema)

  const inOrder = {
    sequenceNumber: 2,
    horizontal: 4,
    vertical: 4
  }
  const notInOrder = {
    horizontal: 4,
    vertical: 4,
    sequenceNumber: 2
  }

  it('should work if defined in order', () => {
    const serialized = movementModel.toBuffer(inOrder)
    const deserialized = movementModel.fromBuffer(serialized)

    expect(deserialized.sequenceNumber).toBe(2)
    expect(deserialized.horizontal).toBe(4)
    expect(deserialized.vertical).toBe(4)
  })

  it('should work if NOT defined in order', () => {
    const serialized = movementModel.toBuffer(notInOrder)
    const deserialized = movementModel.fromBuffer(serialized)

    expect(deserialized.sequenceNumber).toBe(2)
    expect(deserialized.horizontal).toBe(4)
    expect(deserialized.vertical).toBe(4)
  })
})

describe('serialize deserialize (complex)', () => {
  const castleSchema = BufferSchema.schema('castle', {
    name: string8,
    health: uint8
  })

  const playerSchema = BufferSchema.schema('player', {
    id: uint8,
    y: int16,
    x: int16
  })

  const gameSchema = BufferSchema.schema('snapshot', {
    name: string8,
    players: [playerSchema],
    castles: [castleSchema]
  })

  const gameModel = new Model(gameSchema)

  const randomOrder = {
    castles: [
      { name: 'beauty      ', health: 100 },
      { health: 78, name: 'beauty2     ' }
    ],
    name: 'myGame      ',
    players: [
      { id: 25, x: 788, y: -14 },
      { x: 1, y: 2, id: 87 }
    ]
  }

  it('should work if defined randomly', () => {
    const serialized = gameModel.toBuffer(randomOrder)
    const deserialized = gameModel.fromBuffer(serialized)

    expect(deserialized.players[0].id).toBe(25)
    expect(deserialized.castles[1].name.trim()).toBe('beauty2')
    expect(deserialized.name.trim()).toBe('myGame')
  })
})
