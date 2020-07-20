export const AnonymousError = function AnonymousError(message) {
  if (!(this instanceof AnonymousError)) throw new TypeError("Class constructor AnonymousError cannot be invoked without 'new'");

  var _this;

  _this = new TypeError(message);
  return _this;
};
export const NamedError = function Expression(message) {
  if (!(this instanceof Expression)) throw new TypeError("Class constructor Expression cannot be invoked without 'new'");

  var _this;

  _this = new Error(message);
  return _this;
};
export const o = {
  SyntaxError: function _SyntaxError(message) {
    if (!(this instanceof _SyntaxError)) throw new TypeError("Class constructor _SyntaxError cannot be invoked without 'new'");

    var _this;

    _this = new SyntaxError(message);
    return _this;
  }
};
