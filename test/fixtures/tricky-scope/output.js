export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("Class constructor MyError cannot be invoked without 'new'");

  var _this;

  _this = new Error(message);
  const _this2 = 1;
  const _Error = 1;
  const _MyError = 1;
  console.log(_this2, _Error, _MyError);
  Error.prototype.toString.call(_this);
  {
    const _Error2 = 2;
    const _MyError2 = 2;
    console.log(_Error2, _MyError2);
    Error.prototype.toString.call(_this);
  }
  return _this;
}
