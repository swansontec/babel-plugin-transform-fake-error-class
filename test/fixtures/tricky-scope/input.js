export class MyError extends Error {
  constructor(message) {
    super(message)

    const _this = 1
    const Error = 1
    const MyError = 1
    console.log(_this, Error, MyError)
    super.toString()

    {
      const Error = 2
      const MyError = 2
      console.log(Error, MyError)
      super.toString()
    }
  }
}
