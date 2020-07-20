import babel, { PluginObj, types as t, Visitor } from '@babel/core'

import { buildCtorShape, buildStatics } from './building'
import { extractClassShape } from './class-shape'
import { pickOutputId } from './naming'

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

    // Pick some names:
    const classShape = extractClassShape(classPath)
    const baseId = superClass
    const outputId = pickOutputId(classPath, baseId)

    // Build our fake constructor function:
    const ctorShape = buildCtorShape(classShape, baseId, outputId)
    const statics = buildStatics(classShape, baseId, outputId)

    // Replace the class with the function:
    const body = t.blockStatement(ctorShape.body)
    if (classPath.isClassDeclaration()) {
      // Just put the declaration back where it came from:
      classPath.replaceWith(
        t.functionDeclaration(outputId, ctorShape.params, body)
      )
      // Put the statics in as well:
      classPath.insertAfter(statics)
    } else if (statics.length === 0) {
      // Just put the expression back where it came from:
      classPath.replaceWith(
        t.functionExpression(outputId, ctorShape.params, body)
      )
    } else {
      // We need an IIFE to set up our statics:
      const iife = t.callExpression(
        t.parenthesizedExpression(
          t.functionExpression(
            undefined,
            [],
            t.blockStatement([
              t.functionDeclaration(outputId, ctorShape.params, body),
              ...statics,
              t.returnStatement(outputId)
            ])
          )
        ),
        []
      )
      classPath.replaceWith(iife)
    }
  }
}

export default function (babel: Babel): PluginObj<State> {
  return {
    name: 'fake-error-class',
    visitor
  }
}
