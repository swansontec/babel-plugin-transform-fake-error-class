export const AnonymousError = class extends TypeError {}

export const NamedError = class Expression extends Error {}

export const o = {
  SyntaxError: class extends SyntaxError {}
}
