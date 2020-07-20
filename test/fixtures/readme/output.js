export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("Class constructor MyError cannot be invoked without 'new'");

  var _this;

  function _super(message) {
    _this = new Error(message);
    Object.defineProperty(_this, "constructor", {
      value: MyError,
      configurable: true,
      writable: true
    });
    return _this;
  }

  _super(message + '!');

  _this.name = 'MyError';
  return _this;
}
