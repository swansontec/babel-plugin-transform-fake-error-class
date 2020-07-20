// No base at all:
export class Simple {}

// Global base:
export class MyArray extends Array {}

// Local base:
class Helper {}
export class MyHelper extends Helper {}

// Error-shadowing base:
class Error {}
export class MyError extends Error {}

// Self-shadowing bases:
export const CircularError = class ReferenceError extends ReferenceError {}
export class SyntaxError extends SyntaxError {}
