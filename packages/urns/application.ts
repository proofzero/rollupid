import { createRollupIdURNSpace, RollupIdURN } from './index'

export type ApplicationURN = RollupIdURN<`application/${string}`>
export const ApplicationURNSpace = createRollupIdURNSpace<
  'application',
  never,
  never
>('application')
