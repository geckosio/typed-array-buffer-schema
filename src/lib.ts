import { Schema } from './schema'

export class Lib {
  public static _schemas: Map<string, Schema> = new Map()

  public static newHash(name: string, _struct: any) {
    // https://stackoverflow.com/a/7616484/12656855
    const strToHash = (s: string) => {
      let hash = 0

      for (let i = 0; i < s.length; i++) {
        const chr = s.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        hash |= 0 // Convert to 32bit integer
      }
      hash *= 254785 // times a random number
      return Math.abs(hash).toString(32).slice(2, 6)
    }

    let hash = strToHash(JSON.stringify(_struct) + name)
    if (hash.length !== 4) throw new Error('Hash has not length of 4')
    return `#${hash}`
  }

  public static schema(name: string, _struct: Object) {
    const id = Lib.newHash(name, _struct)
    const s = new Schema(id, name, _struct)
    this._schemas.set(id, s)
    return s
  }
}
