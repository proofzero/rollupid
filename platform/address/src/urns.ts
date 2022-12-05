import {
  createThreeIdURNSpace,
  ThreeIdURN,
} from '@kubelt/platform.commons/src/urns'

export type AddressURN = ThreeIdURN<`address/${string}`>
export const AddressURNSpace = createThreeIdURNSpace<'address'>('address')
