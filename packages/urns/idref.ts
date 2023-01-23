import { keccak256 } from '@ethersproject/keccak256'
import { createThreeIdURNSpace, ThreeIdURN } from '.'
import { AddressType } from '../types/address'

export type IDRefURN = ThreeIdURN<`idref/${string}`>
export const IDRefURNSpace = <IDRefType extends AddressType>(
  idsrc: IDRefType
) => createThreeIdURNSpace<`idref:${IDRefType}`, never, never>(`idref:${idsrc}`)

type HashedIDRef = string

export const generateHashedIDRef = (
  idRefNamespace: AddressType,
  clearTextId: string
): HashedIDRef => {
  const idref = IDRefURNSpace(idRefNamespace).urn(clearTextId)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  return hash
}
