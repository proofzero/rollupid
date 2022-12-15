// @kubelt/platform.starbase:src/error.ts

/**
 * Define the errors returned by the service.
 */

import type { RpcErrorDetail } from '@kubelt/openrpc'

// Error Codes
// -----------------------------------------------------------------------------

export enum ErrorCode {
  MappingClientId = -100,
  MissingClientId = -200,
  MissingClientName = -300,
  MissingClientSecret = -400,
  MissingProfile = -500,
  InvalidPublishFlag = -600,
}

// JSON-RPC Errors
// -----------------------------------------------------------------------------

export const ErrorMissingClientId: RpcErrorDetail = {
  code: ErrorCode.MissingClientId,
  message: `client ID was not supplied`,
}

export const ErrorMissingClientName: RpcErrorDetail = {
  code: ErrorCode.MissingClientName,
  message: 'client name not set',
}

export const ErrorMissingClientSecret: RpcErrorDetail = {
  code: ErrorCode.MissingClientSecret,
  message: 'oauth secret not set',
}

export const ErrorMissingProfile: RpcErrorDetail = {
  code: ErrorCode.MissingProfile,
  message: 'missing profile data',
}

export const ErrorMappingClientId: RpcErrorDetail = {
  code: ErrorCode.MappingClientId,
  message: `missing app ID mapping for clientId`,
}

export const ErrorInvalidPublishFlag: RpcErrorDetail = {
  code: ErrorCode.InvalidPublishFlag,
  message: 'invalid "published" parameter',
}
