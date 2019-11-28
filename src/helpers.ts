import { NodePath } from '@babel/traverse'
import * as t from '@babel/types'

export function isDecorated(path: NodePath): boolean {
  const decorators = path.get('decorators')
  return (
    decorators != null && Array.isArray(decorators) && decorators.length > 0
  )
}

/**
 * Pick a name for our error creator function.
 * When anonymous functions appear in assignments,
 * they take a name from the left-hand side.
 */
export function pickOutputName(
  classPath: NodePath<t.Class>,
  errorName: string
): string {
  const name = getClassName(classPath, errorName)
  return name === errorName ? '_' + name : name
}

function getClassName(classPath: NodePath<t.Class>, errorName: string): string {
  const { node, parent } = classPath

  // If the class has a name, use that:
  if (node.id != null) return node.id.name

  // If the parent has a name, use that:
  if (t.isAssignmentExpression(parent)) {
    if (t.isIdentifier(parent.left)) return parent.left.name
  } else if (t.isAssignmentPattern(parent)) {
    if (t.isIdentifier(parent.left)) return parent.left.name
  } else if (t.isVariableDeclarator(parent)) {
    if (t.isIdentifier(parent.id)) return parent.id.name
  } else if (t.isObjectProperty(parent)) {
    if (t.isIdentifier(parent.key)) return parent.key.name
  } else if (t.isExportDefaultDeclaration(parent)) {
    return '_default'
  }

  // Otherwise, return our base class name:
  return errorName
}

interface OutputIds {
  errorId: t.Identifier
  outputId: t.Identifier
  thisId: t.Identifier
  superId: t.Identifier
}

interface FunctionShape {
  body: t.Statement[]
  params: t.FunctionExpression['params']
}

interface OutputBody {
  output: FunctionShape
}

/**
 * Iterate over the class members, fix them,
 * and generate setup code for each one.
 */
export function extractClassMembers(
  classPath: NodePath<t.ClassExpression | t.ClassDeclaration>,
  outputIds: OutputIds
): OutputBody {
  const superBody: t.Statement[] = []
  let constructor: NodePath<t.ClassMethod> | undefined

  const bodyPath = classPath.get('body.body')
  const memberPaths = Array.isArray(bodyPath) ? bodyPath : [bodyPath]
  for (const memberPath of memberPaths) {
    if (isDecorated(memberPath)) {
      throw memberPath.buildCodeFrameError(
        "Error class members can't be decorated"
      )
    }

    if (memberPath.isClassMethod()) {
      if (memberPath.node.kind === 'constructor') {
        constructor = memberPath
        continue
      }

      if (memberPath.node.static) {
        throw memberPath.buildCodeFrameError(
          "Error class methods can't be static (TODO)"
        )
      }

      cleanScope(memberPath, outputIds)
      fixMember(memberPath, outputIds)
      const { key, params, body, kind } = memberPath.node
      const value = t.functionExpression(
        t.isIdentifier(key) ? key : undefined,
        params,
        body
      )
      const type = kind === 'get' || kind === 'set' ? kind : 'value'
      superBody.push(buildDefineProperty(outputIds.thisId, key, value, type))
    } else if (memberPath.isClassProperty()) {
      const value = memberPath.get('value')
      if (!value.isExpression()) continue
      if (memberPath.node.static) {
        throw memberPath.buildCodeFrameError(
          "Error class properties can't be static (TODO)"
        )
      }

      fixMember(value, outputIds)
      superBody.push(
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(outputIds.thisId, memberPath.node.key),
            value.node
          )
        )
      )
    }
  }

  if (superBody.length > 0) {
    // We have setup code, so prepare to call it by grabbing the default
    // `_this = new errorId(message)` statment and matching parameters:
    const superShape = buildDefaultSetup(outputIds)
    superBody.unshift(superShape.body[0])

    if (constructor != null) {
      // We have a constructor & properties,
      // so wrap the setup code in a function:
      const output = extractConstructorBody(constructor, outputIds, true)
      output.body.unshift(
        t.functionDeclaration(
          outputIds.superId,
          superShape.params,
          t.blockStatement(superBody)
        )
      )
      return { output }
    } else {
      // We have no constructor, so use the super body as our output:
      const output = { params: superShape.params, body: superBody }
      return { output }
    }
  } else {
    if (constructor != null) {
      // There is no setup code, so let the constructor initialize `this`:
      const output = extractConstructorBody(constructor, outputIds, false)
      return { output }
    } else {
      // There is no constructor and no setup code, so do the default:
      const output = buildDefaultSetup(outputIds)
      return { output }
    }
  }
}

/**
 * Fixes the constructor body and returns its parameter list.
 */
export function extractConstructorBody(
  memberPath: NodePath<t.ClassMethod>,
  outputIds: OutputIds,
  callSuper: boolean
): FunctionShape {
  cleanScope(memberPath, outputIds, callSuper)
  fixMember(memberPath, outputIds, callSuper)
  const { params, body } = memberPath.node
  return { params, body: body.body }
}

/**
 * Fixes a class member to live in the new fake error environement.
 *
 * - this to thisId
 * - Rename any variables that stomp on errorId / thisId / etc...
 * - super.blah to errorId.prototype.blah
 * - super.blah(...args) to errorId.prototype.blah.call(thisId, ...args)
 *
 * For constructors only:
 * - new.target to outputId
 * - super(...args) to superId(...args) or _this = new errorId(...args)
 */
function fixMember(
  memberPath: NodePath,
  outputIds: OutputIds,
  callSuper?: boolean
): void {
  const isConstructor = callSuper != null

  memberPath.traverse({
    // Bail out if we leave the class:
    Class(path) {
      path.skip()
    },
    ClassProperty(path) {
      path.skip()
    },
    Function(path) {
      if (path.isArrowFunctionExpression()) return
      path.skip()
    },

    // Adjust scope:
    BlockStatement(path) {
      cleanScope(path, outputIds, callSuper)
    },

    // Replace class magic with simple references:
    ThisExpression(path) {
      path.replaceWith(outputIds.thisId)
    },
    CallExpression(path) {
      const calleePath = path.get('callee')
      if (calleePath.isSuper()) {
        if (!isConstructor) {
          throw memberPath.buildCodeFrameError(
            'super() may only be used in class constructors'
          )
        }
        if (callSuper === true) {
          calleePath.replaceWith(outputIds.superId)
        } else {
          path.replaceWith(buildThisSetup(outputIds, path.node.arguments))
        }
      } else if (
        calleePath.isMemberExpression() &&
        t.isSuper(calleePath.node.object)
      ) {
        path.unshiftContainer('arguments', outputIds.thisId)
        calleePath.replaceWith(
          t.memberExpression(
            t.memberExpression(
              t.memberExpression(outputIds.errorId, t.identifier('prototype')),
              calleePath.node.property
            ),
            t.identifier('call')
          )
        )
      }
    },
    MemberExpression(path) {
      const object = path.get('object')
      if (object.isSuper()) {
        object.replaceWith(
          t.memberExpression(outputIds.errorId, t.identifier('prototype'))
        )
      }
    },
    MetaProperty(path) {
      if (!isConstructor) return
      if (!path.get('meta').isIdentifier({ name: 'new' })) return
      if (!path.get('property').isIdentifier({ name: 'target' })) return
      path.replaceWith(outputIds.outputId)
    }
  })
}

/**
 * We need to access stuff from the outer scope, so push aside stuff
 * that might shadow what we need.
 */
function cleanScope(
  path: NodePath,
  outputIds: OutputIds,
  callSuper?: boolean
): void {
  const isConstructor = callSuper != null
  const keys: Array<keyof OutputIds> = isConstructor
    ? callSuper === true
      ? ['errorId', 'thisId', 'outputId', 'superId']
      : ['errorId', 'thisId', 'outputId']
    : ['errorId', 'thisId']

  for (const name of keys) {
    const id = outputIds[name]
    if (path.scope.hasOwnBinding(id.name)) {
      path.scope.rename(id.name)
    }
  }
}

/**
 * Returns the default constructor shape.
 */
function buildDefaultSetup(outputIds: OutputIds): FunctionShape {
  const params = [t.identifier('message')]
  const body = [t.expressionStatement(buildThisSetup(outputIds, params))]
  return { params, body }
}

/**
 * Emit `thisId = new errorId(...args)`
 */
function buildThisSetup(
  outputIds: OutputIds,
  args: t.NewExpression['arguments']
): t.Expression {
  return t.assignmentExpression(
    '=',
    outputIds.thisId,
    t.newExpression(outputIds.errorId, args)
  )
}

/**
 * Emit an assertion that we are being called from a `new` expression.
 */
export function buildCheckNew(outputId: t.Identifier): t.Statement {
  return t.ifStatement(
    t.unaryExpression(
      '!',
      t.binaryExpression('instanceof', t.thisExpression(), outputId)
    ),
    t.throwStatement(
      t.newExpression(t.identifier('TypeError'), [
        t.stringLiteral('This constructor must be called with new')
      ])
    )
  )
}

/**
 * Emit an `Obeject.defineProperty` call.
 */
function buildDefineProperty(
  object: t.Expression,
  key: t.Expression,
  value: t.Expression,
  type: 'get' | 'set' | 'value'
): t.Statement {
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        t.identifier('Object'),
        t.identifier('defineProperty')
      ),
      [
        object,
        key,
        t.objectExpression([
          t.objectProperty(t.identifier(type), value),
          t.objectProperty(
            t.identifier('configurable'),
            t.booleanLiteral(true)
          ),
          t.objectProperty(t.identifier('writable'), t.booleanLiteral(true))
        ])
      ]
    )
  )
}
