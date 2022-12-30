// @kubelt/platform.address:src/jsonrpc/errors.ts

/**
 * Define the errors returned by the service.
 */

import type { RpcErrorDetail } from '@kubelt/openrpc'

// Error Codes
// -----------------------------------------------------------------------------

export enum ErrorCode {
  InvalidAccountId = -100,
  InvalidAddressType,
}

// JSON-RPC Errors
// -----------------------------------------------------------------------------

export const ErrorInvalidAccountId: RpcErrorDetail = {
  code: ErrorCode.InvalidAccountId,
  message: 'invalid account id',
}

export const ErrorInvalidAddressType: RpcErrorDetail = {
  code: ErrorCode.InvalidAddressType,
  message: 'invalid address type',
}
