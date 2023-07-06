import { createRollupIdURNSpace, RollupIdURN } from './index'

export type IdentityGroupQComps = {
  name?: string
}

export type IdentityGroupURN = RollupIdURN<`identity-group/${string}`>
export const IdentityGroupURNSpace = createRollupIdURNSpace<
  'identity-group',
  never,
  IdentityGroupQComps
>('identity-group')
