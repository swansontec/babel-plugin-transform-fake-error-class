export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("Class constructor MyError cannot be invoked without 'new'");

  var _this;

  _this = new Error(message);
  _this.name = 'MyError';
  return _this;
}
