import { createRollupIdURNSpace, RollupIdURN } from './index'

export type IdentityQComps = {
  name?: string
  picture?: string
}

export type IdentityRComps = {} | never

export type IdentityURN = RollupIdURN<`identity/${string}`>
export const IdentityURNSpace = createRollupIdURNSpace<
  'identity',
  IdentityRComps,
  IdentityQComps
>('identity')
