/**
 * @file constants.ts
 */

// The location in the context map where we store a parsed RPC request.
//
// TODO once extracted and validated, pass in the RpcRequest instance as
// an additional handler parameter alongside request and context?
export const REQUEST_CONTEXT_KEY = 'com.kubelt.openrpc/request'
