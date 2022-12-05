import { createThreeIdURNSpace, ThreeIdURN } from './index'

export type AddressURN = ThreeIdURN<`address/${string}`>
export const AddressURNSpace = createThreeIdURNSpace<'address'>('address')
