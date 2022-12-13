// @kubelt/platform.starbase:src/error.ts

/**
 * Define the errors returned by the service.
 */

// Error Codes
// -----------------------------------------------------------------------------

export enum ErrorCode {
  MissingClientName = -100,
  MissingClientSecret = -200,
}

// JSON-RPC Errors
// -----------------------------------------------------------------------------

export const ErrorMissingClientName = {
  code: ErrorCode.MissingClientName,
  message: 'client name not set',
}

export const ErrorMissingClientSecret = {
  code: ErrorCode.MissingClientSecret,
  message: 'oauth secret not set',
}
