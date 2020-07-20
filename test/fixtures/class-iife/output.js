export const Test = (function () {
  function _Test(message) {
    if (!(this instanceof _Test)) throw new TypeError("Class constructor _Test cannot be invoked without 'new'");

    var _this;

    _this = new Error(message);
    Object.defineProperty(_this, "constructor", {
      value: _Test,
      configurable: true,
      writable: true
    });
    return _this;
  }

  Object.defineProperty(_Test, "isTest", {
    value: function isTest(error) {
      return error.constructor === Test;
    },
    configurable: true,
    writable: true
  });
  Object.defineProperty(_Test, "staticAccessor", {
    get: function staticAccessor() {
      return 'red';
    },
    configurable: true
  });
  _Test.staticProperty = 4;

  _Test.staticArrow = () => Error.name;

  return _Test;
})();
