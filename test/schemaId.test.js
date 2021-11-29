const { BufferSchema, Model, uint8, int16, uint16 } = require('../lib/index.js')
const { Schema } = require('../lib/schema.js')

describe('get schema id test', () => {
  const schema = BufferSchema.schema('mySchema', {
    id: uint8,
    x: { type: uint16, digits: 4 }
  })

  const model = new Model(schema)
  const state = { id: 0, x: 1.2345 }
  const buffer = model.toBuffer(state)

  test('should get the same ids', () => {
    const bufferId = BufferSchema.getIdFromBuffer(buffer)
    const schemaId = BufferSchema.getIdFromSchema(schema)
    const modelId = BufferSchema.getIdFromModel(model)

    expect(bufferId).toBe(schemaId)
    expect(schemaId).toBe(modelId)
  })
})
