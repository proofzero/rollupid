import {
  createThreeIdURNSpace,
  ThreeIdURN,
} from '@kubelt/platform.commons/src/urns'

export type AccountURN = ThreeIdURN<`account/${string}`>
export const AccountURNSpace = createThreeIdURNSpace<'account'>('account')
