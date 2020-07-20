import { NodePath, types as t } from '@babel/core'

export interface ClassShape {
  ctor?: NodePath<t.ClassMethod>
  methods: Array<NodePath<t.ClassMethod>>
  properties: Array<NodePath<t.ClassProperty>>
  staticMethods: Array<NodePath<t.ClassMethod>>
  staticProperties: Array<NodePath<t.ClassProperty>>

  // A unique id that will not conflict with any members:
  thisId: t.Identifier
}

/**
 * Extract & categorize the contents of a class.
 */
export function extractClassShape(classPath: NodePath<t.Class>): ClassShape {
  assertUndecorated(classPath)
  const out: ClassShape = {
    methods: [],
    properties: [],
    staticMethods: [],
    staticProperties: [],
    thisId: classPath.scope.generateUidIdentifier('this')
  }

  const bodyPath = classPath.get('body').get('body')
  for (const memberPath of bodyPath) {
    if (memberPath.isClassMethod()) {
      assertUndecorated(memberPath)
      if (memberPath.node.kind === 'constructor') {
        out.ctor = memberPath
      } else if (memberPath.node.static) {
        out.staticMethods.push(memberPath)
      } else {
        out.methods.push(memberPath)
      }
    } else if (memberPath.isClassProperty()) {
      assertUndecorated(memberPath)
      if (memberPath.node.static) {
        out.staticProperties.push(memberPath)
      } else {
        out.properties.push(memberPath)
      }
    } else if (
      t.isClassPrivateMethod(memberPath.node) ||
      t.isClassPrivateProperty(memberPath.node)
    ) {
      throw memberPath.buildCodeFrameError(
        "Error class members can't be private"
      )
    }
  }

  return out
}

function assertUndecorated(
  path: NodePath<t.Class> | NodePath<t.ClassMethod> | NodePath<t.ClassProperty>
): void {
  const { decorators } = path.node
  if (decorators != null && decorators.length > 0) {
    throw path.buildCodeFrameError("Error classes can't be decorated")
  }
}
