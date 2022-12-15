// @kubelt/platform.edges:src/error.ts

/**
 * Defines the error responses sent by the service.
 */

import type { RpcErrorDetail } from '@kubelt/openrpc'

// Error Codes
// -----------------------------------------------------------------------------

export enum ErrorCode {
  MissingNodeId = 1,
  InvalidNodeId,
  MissingSourceNode,
  InvalidSourceNode,
  MissingDestinationNode,
  InvalidDestinationNode,
  MissingEdgeTag,
  InvalidEdgeTag,
  InvalidEdgeDirection,
}

// Errors
// -----------------------------------------------------------------------------

export const ErrorMissingNodeId: RpcErrorDetail = {
  code: ErrorCode.MissingNodeId,
  message: 'missing node ID',
}

export const ErrorInvalidNodeId: RpcErrorDetail = {
  code: ErrorCode.InvalidNodeId,
  message: 'invalid node ID',
}

export const ErrorMissingSourceNode: RpcErrorDetail = {
  code: ErrorCode.MissingSourceNode,
  message: 'missing source node URN',
}

export const ErrorInvalidSourceNode: RpcErrorDetail = {
  code: ErrorCode.InvalidSourceNode,
  message: 'invalid source node URN',
}

export const ErrorMissingDestinationNode: RpcErrorDetail = {
  code: ErrorCode.MissingDestinationNode,
  message: 'missing destination node URN',
}

export const ErrorInvalidDestinationNode: RpcErrorDetail = {
  code: ErrorCode.InvalidDestinationNode,
  message: 'invalid destination node URN',
}

export const ErrorMissingEdgeTag: RpcErrorDetail = {
  code: ErrorCode.MissingEdgeTag,
  message: 'missing edge tag',
}

export const ErrorInvalidEdgeTag: RpcErrorDetail = {
  code: ErrorCode.InvalidEdgeTag,
  message: 'invalid edge tag URN',
}

export const ErrorInvalidEdgeDirection: RpcErrorDetail = {
  code: ErrorCode.InvalidEdgeDirection,
  message: 'invalid edge direction',
}

// Utilities
// -----------------------------------------------------------------------------

export function withErrorData(
  error: RpcErrorDetail,
  data: Record<string, any>
): RpcErrorDetail {
  return Object.assign({ data }, error)
}
