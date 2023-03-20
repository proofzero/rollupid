import { ZodError } from 'zod'

import { TRPCErrorShape, TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc'
import type { TRPCError } from '@trpc/server/src/error/TRPCError'

import { RollupError, HTTP_STATUS_CODES } from '@proofzero/errors'

type OnErrorOptions = { error: TRPCError }

interface OnErrorFunction {
  (options: OnErrorOptions): void
}

export const serverOnError: OnErrorFunction = ({ error }) => {
  if (error.cause instanceof RollupError) console.error(error.cause)
  else console.error(error)
}

type ErrorFormatterOptions = { shape: TRPCErrorShape; error: TRPCError }

interface ErrorFormatterFunction {
  (options: ErrorFormatterOptions): TRPCErrorShape
}

export const errorFormatter: ErrorFormatterFunction = ({ shape, error }) => {
  if (error.cause instanceof RollupError)
    return formatRollupError(shape, error.cause)
  else if (error.cause instanceof ZodError)
    return formatZodError(shape, error.cause)
  else return shape
}

const formatRollupError = (shape: TRPCErrorShape, error: RollupError) => {
  return {
    ...shape,
    code: TRPC_ERROR_CODES_BY_KEY[error.code],
    data: {
      ...shape.data,
      code: error.code,
      httpStatus: HTTP_STATUS_CODES[error.code],
      rollupError: error,
    },
  }
}

const formatZodError = (shape: TRPCErrorShape, error: ZodError) => {
  return {
    ...shape,
    data: {
      ...shape.data,
      zodError: error.flatten(),
    },
  }
}
