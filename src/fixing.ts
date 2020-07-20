import { types as t, Visitor } from '@babel/core'
import { Scope } from '@babel/traverse'

interface Options {
  // We always resolve `super` to either the base class or its prototype:
  isStatic: boolean
  baseId: t.Identifier

  // Bind `this` when present:
  thisId?: t.Identifier

  // Allow calls to `super()` when present (for constructors):
  superId?: t.Identifier
}

/**
 * Build a visitor that can fix class members.
 *
 * This will always fix `super` to refer to the base class,
 * and can also bind `this` for constructors and property expressions.
 */
export function makeFixes(opts: Options): Visitor {
  const { baseId, thisId, superId } = opts
  const base = opts.isStatic
    ? baseId
    : t.memberExpression(baseId, t.identifier('prototype'))

  const out: Visitor = {
    // Stop visiting at the class boundaries.
    //
    // The things we care about are `super` and `this`,
    // and those go out of scope at both function and class boundaries
    // (but not arrow function boundaries).
    Class(path) {
      path.skip()
    },
    FunctionDeclaration(path) {
      path.skip()
    },
    FunctionExpression(path) {
      path.skip()
    },
    ObjectMethod(path) {
      path.skip()
    },

    // Fix scope shadowing.
    //
    // We always need baseId to be available so `super` works,
    // so move aside any names that would stomp it.
    BlockStatement(path) {
      cleanScope(path.scope, baseId)
    },
    ArrowFunctionExpression(path) {
      cleanScope(path.scope, baseId)
    },

    // Fix super for everybody.
    //
    // Constructors have the extra ability to call `super` like a function,
    // but everyone can access `super` properties.
    CallExpression(path) {
      const calleePath = path.get('callee')
      if (calleePath.isSuper()) {
        if (superId == null) {
          throw path.buildCodeFrameError(
            'super() may only be used in class constructors'
          )
        }
        calleePath.replaceWith(superId)
      } else if (
        calleePath.isMemberExpression() &&
        t.isSuper(calleePath.node.object)
      ) {
        path.unshiftContainer(
          'arguments',
          thisId != null ? thisId : t.thisExpression()
        )
        calleePath.replaceWith(
          t.memberExpression(
            t.memberExpression(base, calleePath.node.property),
            t.identifier('call')
          )
        )
      }
    },
    MemberExpression(path) {
      const object = path.get('object')
      if (object.isSuper()) object.replaceWith(base)
    }
  }

  // Only bind `this` for constructors and properties:
  if (thisId != null) {
    out.ThisExpression = path => {
      path.replaceWith(thisId)
    }
  }

  return out
}

/**
 * Shove aside any local variables that might confict with the indentifier.
 */
export function cleanScope(scope: Scope, id: t.Identifier): void {
  if (scope.hasOwnBinding(id.name)) scope.rename(id.name)
}
