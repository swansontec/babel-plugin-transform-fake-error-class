export const AnonymousError = class extends TypeError {}

export const NamedError = class Expression extends Error {}

export const CircularError = class ReferenceError extends ReferenceError {}

export const o = {
  SyntaxError: class extends SyntaxError {}
}
