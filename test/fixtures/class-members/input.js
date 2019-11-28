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

  get getter() {
    return this.property
  }

  set setter(value) {
    this.property = value
  }
}
