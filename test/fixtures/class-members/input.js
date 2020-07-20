const computed = 'computer'

export class MyError extends Error {
  constructor(message) {
    if (message.length > 10) {
      super(message)
    } else {
      super(message + '!')
    }
    console.log(this.toString())
    console.log(super.toString())
  }

  // Properties:
  property = 0
  arrow = () => console.log(super.toString())

  // Methods:
  method() {
    console.log(this.toString())
    console.log(super.toString())
  }

  get accessor() {
    return this.property
  }

  set accessor(value) {
    this.property = value
  }

  // Static properties:
  static staticProperty = 4
  static staticArrow = () => super.name

  // Static methods:
  static staticMethod() {
    console.log(super.name)
  }

  static get staticAccessor() {
    return 'red'
  }

  // Strange method names:
  [computed]() {}
  'hey all'() {}
  1() {}

  // Strange property names:
  [computed + 'Prop'] = 1
  'howdy folks' = 2
  2 = 2
}
