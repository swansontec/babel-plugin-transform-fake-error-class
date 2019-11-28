export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("This constructor must be called with new");

  var _this;

  function _super(message) {
    _this = new Error(message);
    _this.counter = 0;

    _this.callbackProp = () => {
      _this.counter++;
    };

    Object.defineProperty(_this, method, {
      value: function method() {
        console.log(_this.toString());
        console.log(Error.prototype.toString.call(_this));
      },
      configurable: true,
      writable: true
    });
    Object.defineProperty(_this, getter, {
      get: function getter() {
        return _this.property;
      },
      configurable: true,
      writable: true
    });
    Object.defineProperty(_this, setter, {
      set: function setter(value) {
        _this.property = value;
      },
      configurable: true,
      writable: true
    });
  }

  if (message.length > 10) {
    _super(message);
  } else {
    _super(message + '!');
  }

  console.log(_this.toString());
  console.log(Error.prototype.toString.call(_this));
  return _this;
}
