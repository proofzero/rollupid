/**
 * @file openrpc/jsonrpc/index.ts
 */

// TODO

/*
import {
  JSONRPCCallbackTypePlain,
  JSONRPCVersionTwoRequest,
  Method,
  MethodLike,
  Server,
} from "jayson/promise";
*/

type ID = string | number

// RPC request params can be supplied as an array of values.
export type ParamsArray = Array<any>
// RPC request params can be supplied as an object keyed by the parameter name.
export type ParamsObject = Record<string, unknown>

export type RequestParams = ParamsArray | ParamsObject | undefined

export interface JsonRpcRequest {
  id?: ID | null
  jsonrpc: string
  method: string
  params: RequestParams
}

type JsonRpcBaseResponse = {
  jsonrpc: '2.0'
  id: ID | null
}

export type JsonRpcError = {
  code: number
  message: string
  data?: any
}

export type JsonRpcErrorResponse = JsonRpcBaseResponse & {
  error: JsonRpcError
}

export type JsonRpcResultResponse = JsonRpcBaseResponse & {
  result: any
}

export type JsonRpcResponse = JsonRpcErrorResponse | JsonRpcResultResponse

// Errors
// -----------------------------------------------------------------------------
// TODO migrate into separate error module.

// Invalid JSON was received by the server. An error occurred on the
// server while parsing the JSON text.
export const ERROR_PARSE: JsonRpcError = {
  code: -32700,
  message: 'Parse error',
}

// The JSON sent is not a valid Request object.
export const ERROR_INVALID_REQUEST: JsonRpcError = {
  code: -32600,
  message: 'Invalid Request',
}

// The method does not exist / is not available.
export const ERROR_METHOD_NOT_FOUND: JsonRpcError = {
  code: -32601,
  message: 'Method not found',
}

// Invalid method parameter(s).
export const ERROR_INVALID_PARAMS: JsonRpcError = {
  code: -32602,
  message: 'Invalid params',
}

// Internal JSON-RPC error.
export const ERROR_INTERNAL: JsonRpcError = {
  code: -32603,
  message: 'Internal error',
}

// TODO
// -32000 to -32099 	Server error 	Reserved for implementation-defined server-errors.

// Implementation
// -----------------------------------------------------------------------------

export const response = (rpcResponse: JsonRpcResponse): Response => {
  const body = JSON.stringify(rpcResponse)
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// error
// -----------------------------------------------------------------------------

export const error = (
  request: JsonRpcRequest,
  error: JsonRpcError
): JsonRpcErrorResponse => {
  return {
    jsonrpc: '2.0',
    id: request.id || null,
    error,
  }
}
