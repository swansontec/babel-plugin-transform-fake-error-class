export const Test = class extends Error {
  // Static properties:
  static staticProperty = 4
  static staticArrow = () => super.name

  // Static methods:
  static isTest(error) {
    return error.constructor === Test
  }

  static get staticAccessor() {
    return 'red'
  }
}
