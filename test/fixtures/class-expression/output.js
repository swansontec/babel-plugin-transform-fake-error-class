export const AnonymousError = function AnonymousError(message) {
  if (!(this instanceof AnonymousError)) throw new TypeError("This constructor must be called with new");

  var _this;

  _this = new TypeError(message);
  return _this;
};
export const NamedError = function Expression(message) {
  if (!(this instanceof Expression)) throw new TypeError("This constructor must be called with new");

  var _this;

  _this = new Error(message);
  return _this;
};
export const CircularError = class ReferenceError extends ReferenceError {};
export const o = {
  SyntaxError: function _SyntaxError(message) {
    if (!(this instanceof _SyntaxError)) throw new TypeError("This constructor must be called with new");

    var _this;

    _this = new SyntaxError(message);
    return _this;
  }
};
