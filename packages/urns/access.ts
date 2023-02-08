import { createRollupIdURNSpace, RollupIdURN } from './index'

export type AccessRComp = {
  client_id?: string
  grant_type?: string
}
export type AccessURN = RollupIdURN<`access/${string}`>
export const AccessURNSpace = createRollupIdURNSpace<
  'access',
  AccessRComp,
  never
>('access')
