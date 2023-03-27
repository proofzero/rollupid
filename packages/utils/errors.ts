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

const ROLLUP_ERROR_CLASS_BY_CODE = {
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
    if ('rollupError' in error.data) {
      const cause = (error.data as { rollupError: RollupError }).rollupError
      if (ERROR_CODES[cause.code]) {
        const ErrorClass = ROLLUP_ERROR_CLASS_BY_CODE[cause.code]
        return new ErrorClass(cause)
      } else {
        return new RollupError(cause)
      }
    } else if ('zodError' in error.data) {
      const cause = (error.data as { zodError: object }).zodError
      return new Error('data error', { cause })
    } else return error
  } else if (typeof error == 'object') {
    if ((error as Error).name == 'RollupError') {
      const cause = error as RollupError
      if (ERROR_CODES[cause.code]) {
        const ErrorClass = ROLLUP_ERROR_CLASS_BY_CODE[cause.code]
        return new ErrorClass(cause)
      } else {
        return new RollupError(cause)
      }
    } else {
      return new Error('unknown error', { cause: error })
    }
  } else {
    return new Error('unknown error', { cause: error })
  }
}

export const throwJSONError = (error: unknown): void => {
  let cause

  try {
    cause = getErrorCause(error)
  } catch (e) {
    console.error('Error handling error', e)

    throw json(
      {
        message: 'unknown error',
      },
      500
    )
  }
  const body = { ...cause, message: cause.message }
  if (cause instanceof RollupError) {
    const status = HTTP_STATUS_CODES[cause.code]
    throw json(body, status)
  } else if (cause instanceof TRPCClientError) {
    throw json(body, cause.data.httpStatus)
  } else {
    throw json(body, 500)
  }
}
