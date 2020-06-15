import { Schema } from './schema'
import { Serialize } from './serialize'

export class Model extends Serialize {
  constructor(protected schema: Schema) {
    super(schema)
  }
}
