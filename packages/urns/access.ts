import { createRollupIdURNSpace, RollupIdURN } from './index'

export type AccessURN = RollupIdURN<`access/${string}`>
export const AccessURNSpace = createRollupIdURNSpace<'access', never, never>(
  'access'
)
