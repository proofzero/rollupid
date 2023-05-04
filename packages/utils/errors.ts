import { json } from '@remix-run/cloudflare'
import { TRPCClientError } from '@trpc/client'

import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RollupError,
  ERROR_CODES,
  HTTP_STATUS_CODES,
} from '@proofzero/errors'

export const ROLLUP_ERROR_CLASS_BY_CODE = {
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: RollupError,
  [ERROR_CODES.BAD_REQUEST]: BadRequestError,
  [ERROR_CODES.UNAUTHORIZED]: UnauthorizedError,
  [ERROR_CODES.FORBIDDEN]: ForbiddenError,
  [ERROR_CODES.NOT_FOUND]: NotFoundError,
}

export const getErrorCause = (error: unknown): Error => {
  if (error instanceof RollupError) {
    return error
  } else if (error instanceof TRPCClientError) {
    return getErrorFromTRPCClientError(error)
  } else if (typeof error == 'object' && error) {
    return getErrorFromObject(error)
  }
  return new Error('unknown error', { cause: error })
}

const getErrorFromTRPCClientError = (error: any): Error => {
  if (error.data && 'rollupError' in error.data) {
    const cause = (error.data as { rollupError: RollupError }).rollupError
    if (ERROR_CODES[cause.code]) {
      const ErrorClass = ROLLUP_ERROR_CLASS_BY_CODE[cause.code]
      return new ErrorClass(cause)
    } else {
      return new RollupError(cause)
    }
  } else if (error.data && 'zodError' in error.data) {
    const cause = (error.data as { zodError: object }).zodError
    return new Error('data error', { cause })
  }

  return error
}

const getErrorFromObject = (error: object): Error => {
  if ((error as Error).name == 'RollupError') {
    const cause = error as RollupError
    if (ERROR_CODES[cause.code]) {
      const ErrorClass = ROLLUP_ERROR_CLASS_BY_CODE[cause.code]
      return new ErrorClass(cause)
    } else {
      return new RollupError(cause)
    }
  } else if (error && 'request' in error && 'response' in error) {
    if (
      typeof error.response === 'object' &&
      error.response &&
      'errors' in error.response &&
      Array.isArray(error.response.errors)
    )
      return getErrorCause(error.response.errors[0])
  }

  return new Error('unknown error', { cause: error })
}

export const JsonError = (error: unknown) => {
  let cause

  try {
    cause = getErrorCause(error)
  } catch (e) {
    console.error('Error handling error', e)

    return json(
      {
        message: 'unknown error',
      },
      500
    )
  }
  const body = { ...cause, message: cause.message }
  if (cause instanceof RollupError) {
    const status = HTTP_STATUS_CODES[cause.code]
    return json(body, status)
  } else if (cause instanceof TRPCClientError) {
    return json(
      body,
      cause.data?.httpStatus ||
        HTTP_STATUS_CODES[ERROR_CODES.INTERNAL_SERVER_ERROR]
    )
  } else {
    return json(body, 500)
  }
}
