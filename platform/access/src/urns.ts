import {
  createThreeIdURNSpace,
  ThreeIdURN,
} from '@kubelt/platform.commons/src/urns'

export type AccessURN = ThreeIdURN<`access/${string}`>
export const AccessURNSpace = createThreeIdURNSpace<'access'>('access')
