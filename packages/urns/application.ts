import { createRollupIdURNSpace, RollupIdURN } from './index'

export type ApplicationQComps = {
  name?: string
  iconURL?: string
}

export type ApplicationURN = RollupIdURN<`application/${string}`>
export const ApplicationURNSpace = createRollupIdURNSpace<
  'application',
  never,
  ApplicationQComps
>('application')
