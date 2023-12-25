import { keccak256 } from 'viem'

import { createRollupIdURNSpace, RollupIdURN } from '.'
import { AccountType } from '../types/account'

export type IDRefURN = RollupIdURN<`idref/${string}`>
export const IDRefURNSpace = <IDRefType extends AccountType>(
  idsrc: IDRefType
) =>
  createRollupIdURNSpace<`idref:${IDRefType}`, never, never>(`idref:${idsrc}`)

type HashedIDRef = string

export const generateHashedIDRef = (
  idRefNamespace: AccountType,
  clearTextId: string
): HashedIDRef => {
  const idref = IDRefURNSpace(idRefNamespace).urn(clearTextId)
  const encoder = new TextEncoder()
  const hash = keccak256(encoder.encode(idref))
  return hash
}
