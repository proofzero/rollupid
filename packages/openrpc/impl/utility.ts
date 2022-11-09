/**
 * @file impl/utility.ts
 */

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
