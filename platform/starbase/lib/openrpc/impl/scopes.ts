/**
 * @file impl/scopes.ts
 */

import * as set from "ts-set-utils";

import type {
  RpcMethods,
  ScopeSet,
} from "../index";

// internal
// -----------------------------------------------------------------------------

// Check that the set of scopes required on methods is a subset of all scopes
// declared on the object. Any required scopes that aren't declared by the class
// are returned; if this set is non-empty that indicates an error by the developer.
function getUndeclaredScopes(
  declaredScopes: ScopeSet,
  reqScopes: ScopeSet,
): ScopeSet {
  return set.difference(reqScopes, declaredScopes);
}

function getExtraScopes(
  declaredScopes: ScopeSet,
  reqScopes: ScopeSet,
): ScopeSet {
  console.log(declaredScopes.size);
  for (const x of declaredScopes.values()) {
    console.log(x);
  }

  console.log(reqScopes.size);
  for (const x of reqScopes.values()) {
    console.log(x);
  }

  const diffScopes = set.difference(declaredScopes, reqScopes);
  console.log(diffScopes.size);
  for (const x of diffScopes.values()) {
    console.log(x);
  }

  console.log("-----");

  return set.difference(declaredScopes, reqScopes);
}

// Collect all scopes required by RPC methods, including standard
// "methods" (declared in the schema) and "extensions" (defined
// programmatically).
function gatherScopes(
  methods: RpcMethods,
  extensions: RpcMethods,
): ScopeSet {
  let scopes: ScopeSet = new Set();

  for (const methodSym of methods.keys()) {
    const method = methods.get(methodSym);
    if (method !== undefined) {
      scopes = set.union(scopes, method.scopes);
    } else {
      throw new Error(`missing method configuration for ${methodSym.description}`);
    }
  }
  for (const methodSym of extensions.keys()) {
    const extension = extensions.get(methodSym);
    if (extension !== undefined) {
      scopes = set.union(scopes, extension.scopes);
    } else {
      throw new Error(`missing method configuration for ${methodSym.description}`);
    }
  }
 return scopes;
}

function checkUndeclared(
  allScopes: ScopeSet,
  svcScopes: ScopeSet,
) {
  const undeclaredScopes = getUndeclaredScopes(allScopes, svcScopes);

  if (undeclaredScopes.size > 0) {
    const errorScopes = [];
    for (const scope of undeclaredScopes.values()) {
      errorScopes.push(scope.description);
    }
    const scopeMsg = errorScopes.join(", ");
    throw Error(`undeclared scopes: ${scopeMsg}; try adding to @scopes`);
  }
}

function checkExtraneous(
  allScopes: ScopeSet,
  svcScopes: ScopeSet,
) {
  const extraScopes = getExtraScopes(allScopes, svcScopes);

  if (extraScopes.size > 0) {
    const errorScopes = [];
    for (const scope of extraScopes.values()) {
      console.log(scope);
      errorScopes.push(scope.description);
    }
    const scopeMsg = errorScopes.join(", ");
    throw Error(`extra scopes: ${scopeMsg}; try removing from @scopes`);
  }
}

// preflight
// -----------------------------------------------------------------------------

/**
 * Given a set of scopes (declared on a component in typical usage), check that
 * every RPC method and extension's required scopes are in the set. If a scope
 * is missing, throw an error to report to the user that they need to declare
 * scopes at the component level.
 */
export function preflight(
  allScopes: ScopeSet,
  methods: RpcMethods,
  extensions: RpcMethods,
) {
  // Get the combined set of scopes required by all methods and extensions.
  const svcScopes = gatherScopes(methods, extensions);

  // Check for scopes that are required but not declared on the component level.
  checkUndeclared(allScopes, svcScopes);
  // Check for scopes that are declared but never required by a method/extension.
  checkExtraneous(allScopes, svcScopes);
}
