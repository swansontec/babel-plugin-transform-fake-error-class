export class MyError extends Error {
  counter = 0

  callbackProp = () => {
    this.counter++
  }

  constructor(message) {
    if (message.length > 10) {
      super(message)
    } else {
      super(message + '!')
    }
    console.log(this.toString())
    console.log(super.toString())
  }

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
}
