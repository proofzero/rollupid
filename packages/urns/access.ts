import { createThreeIdURNSpace, ThreeIdURN } from './index'

export type AccessURN = ThreeIdURN<`access/${string}`>
export const AccessURNSpace = createThreeIdURNSpace<'access', never, never>(
  'access'
)
