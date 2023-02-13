import { createRollupIdURNSpace, RollupIdURN } from '.'

export type AccessRComp = {
  client_id: string
}

export type AccessURN = RollupIdURN<`access/${string}`>
export const AccessURNSpace = createRollupIdURNSpace<'access', AccessRComp>(
  'access'
)
