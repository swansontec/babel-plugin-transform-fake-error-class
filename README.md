# babel-plugin-transform-fake-error-class

If you want to create your own error types, extending `Error` is the best way to do that:

```javascript
class MyError extends Error {
  constructor(message) {
    super(message)
    this.name = 'MyError'
  }
}
```

Unfortunately, this doesn't work in old ES5 environments, and Babel's built-in class transforms don't always give good stack traces.

Since extending the built-in `Error` object doesn't always work, this plugin doesn't do that. Instead, it transforms the above class into something like this:

```javascript
function MyError(message) {
  var _this = new Error(message)
  _this.name = 'MyError'
  return _this
}
```

This works almost perfectly in both old and new environments. You still call `new MyError()`, just as before, properties like `name` appear as they should, and stack traces look perfect, but under the hood this is no longer a class. That means `instanceof MyError` will always return false, but that's the only major downside.

This plugin also supports methods and class properties, but not static ones yet:

```javascript
class MyError extends Error {
  name = 'MyError'
  getReason() {}
  static todo() {} // Not yet supported
}
```

## Installing

```sh
npm install --save-dev babel-plugin-transform-fake-error-class
# or
yarn add --dev babel-plugin-transform-fake-error-class
```

Now add this plugin to your `.babelrc`:

```json
{
  "plugins": [
    "babel-plugin-transform-fake-error-class"
  ]
}
```
