export class MyError extends Error {
  constructor(message) {
    // super and this should get unique names:
    super(message)

    // Locals should just rename MyError and Error:
    const _super = 1
    const _this = 1
    const Error = 1
    const MyError = 1
    console.log(_super, _this, Error, MyError)

    // Block scope should rename Error:
    {
      const _super = 2
      const _this = 2
      const Error = 2
      const MyError = 2
      console.log(_super, _this, Error, MyError)
    }

    // Arrow scope should rename Error:
    this.yep = (_super, _this, Error, MyError) => {
      console.log(_super, _this, Error, MyError)
    }

    // Function scope should undergo no changes:
    this.nope = function () {
      const _super = 4
      const _this = 4
      const Error = 4
      const MyError = 4
      console.log(_super, _this, Error, MyError)
    }
  }
}
