//var property

export class Schema {
  private _bytes: number = 0

  constructor(private _id: string, private _name: string, private _struct: Object) {
    Schema.Validation(_struct)
    this.calcBytes()
  }

  public static Validation(struct: Object) {
    // do all the validation here (as static me)
  }

  public get id() {
    return this._id
  }

  public get name() {
    return this._name
  }

  private calcBytes() {
    const iterate = (obj: any) => {
      for (let property in obj) {
        const type = obj?._type || obj?.type?._type
        const bytes = obj?._bytes || obj?.type?._bytes

        if (!type && obj.hasOwnProperty(property)) {
          if (typeof obj[property] === 'object') {
            iterate(obj[property])
          }
        }
        //---
        else {
          if (property !== '_type' && property !== 'type') continue
          if (!bytes) continue

          // we multiply the bytes by the String8 / String16 length.
          if (type === 'String8' || type === 'String16') {
            const length = obj.length || 12
            this._bytes += bytes * length
          } else {
            this._bytes += bytes
          }
        }
      }
    }
    iterate(this._struct)
  }

  public get struct() {
    return this._struct
  }

  public get bytes() {
    return this._bytes
  }
}
