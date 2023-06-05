import {
  json,
  DataFunctionArgs,
  ActionFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'
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
import { TraceSpan } from '@proofzero/platform-middleware/trace'

export type RemixRequestFunctionWrapper<
  T extends LoaderFunction | ActionFunction
> = (func: T) => T extends LoaderFunction ? LoaderFunction : ActionFunction

/** Returns `LoaderFunction` or `ActionFunction` passed in, with the Rollup's
 * standard error handling where a thrown error is concisely logged to error console
 * and is re-thrown as a `JsonError` with the trace context inlcluded
 */
//Overloads necessary to get 1-to-1 mapping from arg to return type
export function getRollupReqFunctionErrorWrapper(
  reqFunction: LoaderFunction
): LoaderFunction
export function getRollupReqFunctionErrorWrapper(
  reqFunction: ActionFunction
): ActionFunction
export function getRollupReqFunctionErrorWrapper(
  reqFunction: LoaderFunction | ActionFunction
): LoaderFunction | ActionFunction {
  return async (args: DataFunctionArgs) => {
    const { context } = args

    try {
      const result = await reqFunction(args)
      return result
    } catch (e) {
      //Needed for when we throw redirects
      if (e instanceof Response) return e as Response

      const error = getErrorCause(e) as Error
      const { stack, ...otherProps } = error
      const traceparent = context.traceSpan
        ? (context.traceSpan as TraceSpan).getTraceParent()
        : 'No trace information'
      const result = {
        ...otherProps,
        message: error.message,
        originalError: e,
        traceparent,
      }
      console.error(result)
      throw JsonError(e, traceparent)
    }
  }
}

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
    console.debug('ZOD', cause)
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

export const JsonError = (error: unknown, traceparent: string) => {
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
  const body = { ...cause, message: cause.message, traceparent }
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
