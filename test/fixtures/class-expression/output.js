export const AnonymousError = function _AnonymousError(message) {
  if (!(this instanceof _AnonymousError)) throw new TypeError("Class constructor _AnonymousError cannot be invoked without 'new'");

  var _this;

  _this = new TypeError(message);
  Object.defineProperty(_this, "constructor", {
    value: _AnonymousError,
    configurable: true,
    writable: true
  });
  return _this;
};
export const NamedError = function Expression(message) {
  if (!(this instanceof Expression)) throw new TypeError("Class constructor Expression cannot be invoked without 'new'");

  var _this2;

  _this2 = new Error(message);
  Object.defineProperty(_this2, "constructor", {
    value: Expression,
    configurable: true,
    writable: true
  });
  return _this2;
};
export const o = {
  SyntaxError: function SyntaxError(message) {
    if (!(this instanceof SyntaxError)) throw new TypeError("Class constructor SyntaxError cannot be invoked without 'new'");

    var _this3;

    _this3 = new SyntaxError(message);
    Object.defineProperty(_this3, "constructor", {
      value: SyntaxError,
      configurable: true,
      writable: true
    });
    return _this3;
  },
  'a b c': function _SyntaxError(message) {
    if (!(this instanceof _SyntaxError)) throw new TypeError("Class constructor _SyntaxError cannot be invoked without 'new'");

    var _this4;

    _this4 = new SyntaxError(message);
    Object.defineProperty(_this4, "constructor", {
      value: _SyntaxError,
      configurable: true,
      writable: true
    });
    return _this4;
  }
};
