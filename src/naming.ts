import { NodePath, types as t } from '@babel/core'

export function pickOutputId(
  path: NodePath<t.Class>,
  baseId: t.Identifier
): t.Identifier {
  if (path.node.id != null) return path.node.id

  const parentScope = path.parentPath.scope
  const implied = getImpliedName(path.parent)
  if (implied != null) {
    if (implied !== 'default' && !parentScope.hasOwnBinding(implied)) {
      return t.identifier(implied)
    }
    return parentScope.generateUidIdentifier(implied)
  } else {
    return parentScope.generateUidIdentifier(baseId.name)
  }
}

/**
 * Anonymous function expressions are supposed to receive a name from
 * the left-hand side if they are in some kind of assignment.
 * See `NamedEvaluation` in the spec.
 * TODO: Babel already implements this somewhere or other.
 * Figure out where and use that instead.
 *
 * This might return 'default', which isn't a valid JS identifier.
 */
function getImpliedName(parent: t.Node): string | void {
  if (t.isAssignmentExpression(parent)) {
    if (t.isIdentifier(parent.left)) return parent.left.name
  } else if (t.isAssignmentPattern(parent)) {
    if (t.isIdentifier(parent.left)) return parent.left.name
  } else if (t.isVariableDeclarator(parent)) {
    if (t.isIdentifier(parent.id)) return parent.id.name
  } else if (t.isObjectProperty(parent)) {
    if (t.isIdentifier(parent.key)) return parent.key.name
  } else if (t.isExportDefaultDeclaration(parent)) {
    return 'default'
  }
}
