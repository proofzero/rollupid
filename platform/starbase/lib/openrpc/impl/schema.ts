/**
 * @file impl/schema.ts
 */

import invariant from "tiny-invariant";

import { isIterable } from "./utility";

import type {
  RpcSchema,
} from "../index";

// Types
// -----------------------------------------------------------------------------

// A function that takes a $ref and dereferences it to returns the result.
type LookupFn = (ref: string) => any;

// makeLookupFn
// -----------------------------------------------------------------------------

// Given the value of a $ref, look up the value of the reference in
// the schema and return the result. The value of $ref is a
// URI-reference (JSON Pointer) that is resolved against the schema's
// Base URI. A JSON pointer takes the form of A # B in which: A is the
// relative path from the current schema to a target schema. If A is
// empty, the reference is to a type or property in the same schema,
// an in-schema reference.
function makeLookupFn(schema: RpcSchema): LookupFn {
  return (ref: string): any => {
    const parts = ref.split("/");
    invariant(parts[0] === "#", "expected a JSON Pointer for same document");
    // Drop the initial '#' and iterate over the remaining path segments.
    let cursor = schema;
    for (const part of parts.slice(1)) {
      cursor = cursor[part];
    }
    return cursor;
  };
};

// expand
// -----------------------------------------------------------------------------

/**
 * Utility method to expand an OpenRPC schema. All $ref entries in the
 * schema are replaced by the definition they refer to in the returned
 * schema.
 */
export function expand(schema: RpcSchema, lookup: LookupFn): RpcSchema {
  // TODO replace all $ref by their references.
  // TODO new type for expanded schema?
  // Every schema.method becomes MethodObject, rather than MethodOrReference

  // TODO method.params
  // TODO method.result
  // TODO just walk whole structure
  /*
  for (const k in schema) {
    if (isIterable(schema[k])) {
      return expand(schema[k]);
    } else {
      // When a $ref is present it is the only key in the parent object;
      // the entire object should be replaced by the dereferenced value.
      if (k === "$ref") {
        const value = lookup(k);
        console.log(`lookup result: ${value}`);
        console.log(k, value);
        schema[k] = value;
      }
    }
  }
  */
  return schema;
};
