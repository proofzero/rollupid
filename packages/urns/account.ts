import { createRollupIdURNSpace, RollupIdURN } from './index'

export type AccountQComps = {
  name?: string
  picture?: string
}

export type AccountURN = RollupIdURN<`account/${string}`>
export const AccountURNSpace = createRollupIdURNSpace<
  'account',
  never,
  AccountQComps
>('account')
