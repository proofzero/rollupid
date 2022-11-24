// @kubelt/openrpc:constants.ts

/**
 * Package-level constants.
 */

// The location in the context map where we store a parsed RPC request.
export const KEY_REQUEST_RAW = 'com.kubelt.openrpc/request.raw'

// The parsed RPC request.
export const KEY_REQUEST_RPC = 'com.kubelt.openrpc/request.rpc'

// The location in the context map where we store the Environment.
export const KEY_REQUEST_ENV = 'com.kubelt.openrpc/env'

// The location in the context map where we store the ExecutionContext.
export const KEY_REQUEST_CTX = 'com.kubelt.openrpc/context'
