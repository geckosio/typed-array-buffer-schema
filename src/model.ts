import { Schema } from './schema'
import { Serialize } from './serialize'

export class Model extends Serialize {
  /**
   * @param schema Your schema
   * @param bufferSize The max bufferSize in KB (default: 8)
   */
  constructor(public schema: Schema, bufferSize = 8) {
    super(schema, bufferSize)
  }
}
