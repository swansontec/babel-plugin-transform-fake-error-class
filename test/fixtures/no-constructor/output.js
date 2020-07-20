export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("Class constructor MyError cannot be invoked without 'new'");

  var _this;

  _this = new Error(message);
  Object.defineProperty(_this, "constructor", {
    value: MyError,
    configurable: true,
    writable: true
  });
  Object.defineProperty(_this, "method", {
    value: function method() {},
    configurable: true,
    writable: true
  });
  _this.name = 'MyError';
  return _this;
}
