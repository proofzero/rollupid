import { RollupError } from '@proofzero/errors'

export type NodeMethodReturnValue<T, E = RollupError> =
  | {
      value: T
      error?: undefined
    }
  | {
      value?: undefined
      error: E | Error
    }
