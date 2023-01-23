import { createThreeIdURNSpace, ThreeIdURN } from './index'

export type ApplicationURN = ThreeIdURN<`application/${string}`>
export const ApplicationURNSpace = createThreeIdURNSpace<
  'application',
  never,
  never
>('application')
