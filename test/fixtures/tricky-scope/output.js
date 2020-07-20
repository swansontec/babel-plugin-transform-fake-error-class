export function MyError(message) {
  if (!(this instanceof MyError)) throw new TypeError("Class constructor MyError cannot be invoked without 'new'");

  var _this2;

  function _super2(message) {
    _this2 = new Error(message);
    Object.defineProperty(_this2, "constructor", {
      value: MyError,
      configurable: true,
      writable: true
    });
    return _this2;
  }

  // super and this should get unique names:
  _super2(message); // Locals should just rename MyError and Error:


  const _super = 1;
  const _this = 1;
  const _Error = 1;
  const _MyError = 1;
  console.log(_super, _this, _Error, _MyError); // Block scope should rename Error:

  {
    const _super = 2;
    const _this = 2;
    const _Error2 = 2;
    const MyError = 2;
    console.log(_super, _this, _Error2, MyError);
  } // Arrow scope should rename Error:

  _this2.yep = (_super, _this, _Error3, MyError) => {
    console.log(_super, _this, _Error3, MyError);
  }; // Function scope should undergo no changes:


  _this2.nope = function () {
    const _super = 4;
    const _this = 4;
    const Error = 4;
    const MyError = 4;
    console.log(_super, _this, Error, MyError);
  };

  return _this2;
}
