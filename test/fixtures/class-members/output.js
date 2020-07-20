const computed = 'computer';
export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("Class constructor MyError cannot be invoked without 'new'");

  var _this;

  function _super(message) {
    _this = new Error(message);
    Object.defineProperty(_this, "constructor", {
      value: MyError,
      configurable: true,
      writable: true
    });
    Object.defineProperty(_this, "method", {
      value: function method() {
        console.log(this.toString());
        console.log(Error.prototype.toString.call(this));
      },
      configurable: true,
      writable: true
    });
    Object.defineProperty(_this, "accessor", {
      get: function accessor() {
        return this.property;
      },
      configurable: true
    });
    Object.defineProperty(_this, "accessor", {
      set: function accessor(value) {
        this.property = value;
      },
      configurable: true
    });
    Object.defineProperty(_this, computed, {
      value: function computed() {},
      configurable: true,
      writable: true
    });
    Object.defineProperty(_this, 'hey all', {
      value: function () {},
      configurable: true,
      writable: true
    });
    Object.defineProperty(_this, 1, {
      value: function () {},
      configurable: true,
      writable: true
    });
    _this.property = 0;

    _this.arrow = () => console.log(Error.prototype.toString.call(_this));

    _this[computed + 'Prop'] = 1;
    _this['howdy folks'] = 2;
    _this[2] = 2;
    return _this;
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
Object.defineProperty(MyError, "staticMethod", {
  value: function staticMethod() {
    console.log(Error.name);
  },
  configurable: true,
  writable: true
});
Object.defineProperty(MyError, "staticAccessor", {
  get: function staticAccessor() {
    return 'red';
  },
  configurable: true
});
MyError.staticProperty = 4;

MyError.staticArrow = () => Error.name;
