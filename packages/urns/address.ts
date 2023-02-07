import { AddressType, NodeType } from '../types/address'
import { createRollupIdURNSpace, RollupIdURN } from './index'

export type AddressRComp = {
  node_type?: NodeType
  addr_type: AddressType
}

export type AddressQComp = {
  alias?: string
  hidden?: string
  order?: string
}

export type AddressURN = RollupIdURN<`address/${string}`>
export const AddressURNSpace = createRollupIdURNSpace<
  'address',
  AddressRComp,
  AddressQComp
>('address')
