# babel-plugin-transform-fake-error-class

## 1.0.0 (2020-07-21)

- Complete rewrite to address many problems:
  - Support static members.
  - Stop crashing when defining member functions.
  - Stop binding `this` in methods.
  - Support computed properties and other unusual naming.
  - Add a `constructor` property to the output.

## 0.1.1 (2020-07-16)

- Fix `super` to return `this` when called from a constructor.

## 0.1.0 (2019-11-30)

- Initial release.
