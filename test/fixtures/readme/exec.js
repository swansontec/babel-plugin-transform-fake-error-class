class MyError extends Error {
  constructor(message) {
    super(message + '!')
    this.name = 'MyError'
  }
}

const error = new MyError('Some message')
expect(error.name).equals('MyError')
expect(error.toString()).equals('MyError: Some message!')
