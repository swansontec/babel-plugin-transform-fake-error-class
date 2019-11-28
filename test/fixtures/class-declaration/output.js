export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("This constructor must be called with new");

  var _this;

  _this = new Error(message);
  return _this;
}
export class ReferenceError extends ReferenceError {}
export default function _default(message) {
  if (!(this instanceof _default)) throw new TypeError("This constructor must be called with new");

  var _this;

  _this = new TypeError(message);
  return _this;
}
