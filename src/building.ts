import { types as t } from '@babel/core'

import { ClassShape } from './class-shape'
import { cleanScope, makeFixes } from './fixing'

interface FunctionShape {
  params: t.FunctionExpression['params']
  body: t.Statement[]
}

/**
 * Build a list of statements for attaching the class static properties
 * to the class constructor.
 */
export function buildStatics(
  classShape: ClassShape,
  baseId: t.Identifier,
  outputId: t.Identifier
): t.Statement[] {
  const { staticMethods, staticProperties } = classShape
  const out: t.Statement[] = []

  for (const path of staticMethods) {
    path.traverse(makeFixes({ isStatic: true, baseId }))
    out.push(buildMethod(outputId, path.node))
  }

  for (const path of staticProperties) {
    const valuePath = path.get('value')
    if (!valuePath.isExpression()) continue

    valuePath.traverse(makeFixes({ isStatic: true, baseId }))
    out.push(buildProperty(outputId, path.node, valuePath.node))
  }

  return out
}

/**
 * Build a constructor function.
 * This function will construct instances of the class,
 * but it doesn't have any statics attached yet.
 */
export function buildCtorShape(
  classShape: ClassShape,
  baseId: t.Identifier,
  outputId: t.Identifier
): FunctionShape {
  const { ctor, thisId } = classShape
  const superShape = buildSuperShape(classShape, baseId, outputId)

  const ctorStart: t.Statement[] = [
    t.ifStatement(
      t.unaryExpression(
        '!',
        t.binaryExpression('instanceof', t.thisExpression(), outputId)
      ),
      t.throwStatement(
        t.newExpression(t.identifier('TypeError'), [
          t.stringLiteral(
            `Class constructor ${outputId.name} cannot be invoked without 'new'`
          )
        ])
      )
    ),
    t.variableDeclaration('var', [t.variableDeclarator(thisId)])
  ]

  if (ctor != null) {
    cleanScope(ctor.scope, outputId)
    const superId = ctor.scope.generateUidIdentifier('super')
    ctor.traverse(makeFixes({ isStatic: false, baseId, superId, thisId }))
    const { body, params = [] } = ctor.node

    return {
      params,
      body: [
        ...ctorStart,
        t.functionDeclaration(
          superId,
          superShape.params,
          t.blockStatement(superShape.body)
        ),
        ...body.body,
        t.returnStatement(thisId)
      ]
    }
  } else {
    return {
      params: superShape.params,
      body: [...ctorStart, ...superShape.body]
    }
  }
}

/**
 * Builds the `super()` function.
 * The constructor should either call this, or should at least contain these
 * statements inline (for classes without a user-provided constructor).
 */
function buildSuperShape(
  classShape: ClassShape,
  baseId: t.Identifier,
  outputId: t.Identifier
): FunctionShape {
  const { methods, properties, thisId } = classShape
  const params = [t.identifier('message')]

  const body: t.Statement[] = [
    t.expressionStatement(
      t.assignmentExpression('=', thisId, t.newExpression(baseId, params))
    ),
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(
          t.identifier('Object'),
          t.identifier('defineProperty')
        ),
        [
          thisId,
          t.stringLiteral('constructor'),
          t.objectExpression([
            t.objectProperty(t.identifier('value'), outputId),
            t.objectProperty(
              t.identifier('configurable'),
              t.booleanLiteral(true)
            ),
            t.objectProperty(t.identifier('writable'), t.booleanLiteral(true))
          ])
        ]
      )
    )
  ]

  for (const path of methods) {
    path.traverse(makeFixes({ isStatic: false, baseId }))
    body.push(buildMethod(thisId, path.node))
  }

  for (const path of properties) {
    const valuePath = path.get('value')
    if (!valuePath.isExpression()) continue

    valuePath.traverse(makeFixes({ isStatic: false, baseId, thisId }))
    body.push(buildProperty(thisId, path.node, valuePath.node))
  }

  body.push(t.returnStatement(thisId))

  return { params, body }
}

/**
 * Put together an `Object.defineProperty` statment to set up a class method.
 */
function buildMethod(thisId: t.Identifier, node: t.ClassMethod): t.Statement {
  const descriptor: t.ObjectProperty[] = [
    t.objectProperty(
      t.identifier(
        node.kind === 'get' || node.kind === 'set' ? node.kind : 'value'
      ),
      t.functionExpression(
        t.isIdentifier(node.key) ? node.key : undefined,
        node.params,
        node.body
      )
    ),
    t.objectProperty(t.identifier('configurable'), t.booleanLiteral(true))
  ]
  if (node.kind !== 'get' && node.kind !== 'set') {
    descriptor.push(
      t.objectProperty(t.identifier('writable'), t.booleanLiteral(true))
    )
  }

  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        t.identifier('Object'),
        t.identifier('defineProperty')
      ),
      [
        thisId,
        !node.computed && t.isIdentifier(node.key)
          ? t.stringLiteral(node.key.name)
          : node.key,
        t.objectExpression(descriptor)
      ]
    )
  )
}

/**
 * Put together a `this.key = ` statment to set up a class property.
 */
function buildProperty(
  thisId: t.Identifier,
  node: t.ClassProperty,
  value: t.Expression
): t.Statement {
  return t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(
        thisId,
        node.key,
        node.computed || !t.isIdentifier(node.key)
      ),
      value
    )
  )
}
