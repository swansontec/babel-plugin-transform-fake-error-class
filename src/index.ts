import babel, { PluginObj, types as t, Visitor } from '@babel/core'

import {
  buildCheckNew,
  extractClassMembers,
  isDecorated,
  pickOutputName
} from './helpers'

type Babel = typeof babel

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface State {}

const errors = [
  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError'
]

const visitor: Visitor<State> = {
  Class(classPath) {
    const { superClass } = classPath.node

    // Bail out if this is not an error class:
    if (!t.isIdentifier(superClass)) return
    if (!classPath.scope.hasGlobal(superClass.name)) return
    if (errors.indexOf(superClass.name) < 0) return

    // We don't do decorations:
    if (isDecorated(classPath)) {
      throw classPath.buildCodeFrameError("Error classes can't be decorated")
    }

    // What should we call everything?
    const errorName = superClass.name
    const outputIds = {
      errorId: t.identifier(errorName),
      outputId: t.identifier(pickOutputName(classPath, errorName)),
      thisId: t.identifier('_this'),
      superId: t.identifier('_super')
    }

    // Sort the members into buckets:
    const { output } = extractClassMembers(classPath, outputIds)

    // Build the function body:
    const statements: t.Statement[] = [
      buildCheckNew(outputIds.outputId),
      t.variableDeclaration('var', [t.variableDeclarator(outputIds.thisId)]),
      ...output.body,
      t.returnStatement(outputIds.thisId)
    ]

    // Replace the class with the function:
    const body = t.blockStatement(statements)
    const replacement = classPath.isClassExpression()
      ? t.functionExpression(outputIds.outputId, output.params, body)
      : t.functionDeclaration(outputIds.outputId, output.params, body)
    classPath.replaceWith(replacement)
  }
}

export default function (babel: Babel): PluginObj<State> {
  return {
    name: 'fake-error-class',
    visitor
  }
}
