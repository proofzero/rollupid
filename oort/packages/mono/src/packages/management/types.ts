import { Claims } from '../../types'
import { AddressMap } from '../../core'

export type GetClaimsParams = []
export type GetClaimsResult = Claims
export type GetAddressesParams = [[keyof AddressMap]]
export type GetAddressesResult = Partial<AddressMap>
