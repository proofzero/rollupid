import { AccountType, NodeType } from '../types/account'
import { createRollupIdURNSpace, RollupIdURN } from './index'

export type AccountRComp = {
  node_type?: NodeType
  addr_type: AccountType
}

export type AccountQComp = {
  alias?: string
  hidden?: string
  order?: string
}

export type AccountURN = RollupIdURN<`account/${string}`>
export const AccountURNSpace = createRollupIdURNSpace<
  'account',
  AccountRComp,
  AccountQComp
>('account')
