import { getErrorCause } from './errors'

export const formatError = (error: unknown): Error | undefined => {
  if (!(error instanceof Error)) return
  if (!('originalError' in error)) return
  return getErrorCause(error.originalError)
}
