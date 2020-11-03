import { BufferSchema, Model, uint8, int16, uint16 } from './index'
import { Schema } from './schema'
import { string8, int64 } from './views'

const playerSchema = BufferSchema.schema('player', {
  id: uint8,
  name: { type: string8, length: 6 },
  x: { type: int16, digits: 2 },
  y: { type: int16, digits: 2 }
})

const towerSchema = BufferSchema.schema('tower', {
  id: uint8,
  health: uint8,
  team: uint8
})

const mainSchema = BufferSchema.schema('snapshot', {
  time: int64,
  tick: uint16,
  players: [playerSchema],
  towers: [towerSchema]
})

const gameState = {
  time: new Date().getTime(),
  tick: 32580,
  players: [
    { id: 0, name: 'Mistin', x: -14.43, y: 47.78 },
    { id: 1, name: 'Coobim', x: 21.85, y: -78.48 }
  ],
  towers: [
    { id: 0, health: 100, team: 0 },
    { id: 1, health: 89, team: 0 },
    { id: 2, health: 45, team: 1 }
  ]
}

const mainModel = new Model(mainSchema)
const buffer = mainModel.toBuffer(gameState)
const data = mainModel.fromBuffer(buffer)

// toBuffer() shrunk the byte size from 241 to only 56
// that is -77% compression!
console.log(JSON.stringify(gameState).length) // 241
console.log(buffer.byteLength) // 56
console.log(JSON.stringify(data).length) // 241

//------------------------------------------------------------------
// Get the Schema IDs
//------------------------------------------------------------------
const getSchemaIdFromBuffer = (buffer: ArrayBuffer) => {
  const dataView = new DataView(buffer)
  let id = ''

  for (let i = 0; i < 5; i++) {
    const uInt8 = dataView.getUint8(i)
    id += String.fromCharCode(uInt8)
  }

  return id
}

const getSchemaIdFromSchema = (schema: Schema) => schema.id

const bufferId = getSchemaIdFromBuffer(buffer)
const schemaId = getSchemaIdFromSchema(mainSchema)

console.log(`bufferId: ${bufferId}`)
console.log(`schemaId: ${schemaId}`)

if (bufferId === schemaId) console.log(`Schema name is "${mainSchema.name}"`)
