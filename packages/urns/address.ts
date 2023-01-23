import { AddressType, NodeType } from '../types/address'
import { createThreeIdURNSpace, ThreeIdURN } from './index'

export type AddressRComp = {
  node_type?: NodeType
  addr_type: AddressType
}

export type AddressQComp = {
  alias: string
  hidden?: string
}

export type AddressURN = ThreeIdURN<`address/${string}`>
export const AddressURNSpace = createThreeIdURNSpace<
  'address',
  AddressRComp,
  AddressQComp
>('address')
