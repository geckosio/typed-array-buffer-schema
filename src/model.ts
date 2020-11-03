import { Schema } from './schema'
import { Serialize } from './serialize'

export class Model extends Serialize {
  constructor(public schema: Schema) {
    super(schema)
  }
}
