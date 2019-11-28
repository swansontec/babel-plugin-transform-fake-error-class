# babel-plugin-transform-fake-error-class

If you want to create your own error types, extending `Error` is the best way to do that:

```javascript
class MyError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MyError'
  }
}
```

Unfortunately, this doesn't work in old ES5 environments, and Babel's built-in class transform doesn't work well either. Instead, `babel-plugin-transform-fake-error-class` with transform the above class into something like this:

```javascript
function MyError(message) {
  var _this = new Error(message)
  _this.name = 'MyError'
  return _this
}
```

This works almost perfectly in both old and new environments. You can still call `new MyError()`, just as before, properties like `name` will appear as they should, and stack traces look perfect, but under the hood this is no longer a class. That means `instanceof MyError` will always return false, but that's the only major downside.

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
