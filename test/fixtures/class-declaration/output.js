export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("Class constructor MyError cannot be invoked without 'new'");

  var _this;

  _this = new Error(message);
  Object.defineProperty(_this, "constructor", {
    value: MyError,
    configurable: true,
    writable: true
  });
  return _this;
}
export default function _default(message) {
  if (!(this instanceof _default)) throw new TypeError("Class constructor _default cannot be invoked without 'new'");

  var _this2;

  _this2 = new TypeError(message);
  Object.defineProperty(_this2, "constructor", {
    value: _default,
    configurable: true,
    writable: true
  });
  return _this2;
}
