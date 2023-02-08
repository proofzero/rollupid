import { createRollupIdURNSpace, RollupIdURN } from './index'
import { GrantType } from '@kubelt/types/access'

export type AccessRComp = {
  client_id?: string
  grant_type?: GrantType
}
export type AccessURN = RollupIdURN<`access/${string}`>
export const AccessURNSpace = createRollupIdURNSpace<
  'access',
  AccessRComp,
  never
>('access')
