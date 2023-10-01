import { RollupError, HTTP_STATUS_CODES } from '@proofzero/errors'

import { getErrorCause } from './errors'

export const formatError = (error: unknown) => {
  if (!(error instanceof Error)) return
  if (!('originalError' in error)) return
  const cause = getErrorCause(error.originalError)
  if (cause instanceof RollupError)
    return {
      ...cause,
      extensions: {
        http: {
          status: HTTP_STATUS_CODES[cause.code],
        },
      },
    }

  return cause
}
