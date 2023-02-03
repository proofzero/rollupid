import { createRollupIdURNSpace, RollupIdURN } from './index'

export type AccountURN = RollupIdURN<`account/${string}`>
export const AccountURNSpace = createRollupIdURNSpace<'account', never, never>(
  'account'
)
