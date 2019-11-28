import babel, { PluginObj, Visitor } from '@babel/core'

type Babel = typeof babel

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface State {}

const visitor: Visitor<State> = {
  Class(classPath) {
    // TODO
  }
}

export default function(babel: Babel): PluginObj<State> {
  return {
    name: 'fake-error-class',
    visitor
  }
}
