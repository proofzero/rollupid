/**
 * @file src/utility.ts
 */

/**
 * Generic assertion using an "assertion signature".
 */
export function assert (condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

/**
 * Checks whether x is iterable or not.
 */
export function isIterable(x: any): boolean {
  // checks for null and undefined
  if (x == null) {
    return false;
  }
  return (typeof x[Symbol.iterator]) === 'function';
}
