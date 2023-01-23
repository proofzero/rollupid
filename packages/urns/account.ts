import { createThreeIdURNSpace, ThreeIdURN } from './index'

export type AccountURN = ThreeIdURN<`account/${string}`>
export const AccountURNSpace = createThreeIdURNSpace<'account', never, never>(
  'account'
)
