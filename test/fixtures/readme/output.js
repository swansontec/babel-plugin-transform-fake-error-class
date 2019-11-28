function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("This constructor must be called with new");

  var _this;

  _this = new Error(message + '!');
  _this.name = 'MyError';
  return _this;
}
