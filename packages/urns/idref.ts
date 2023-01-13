import { createThreeIdURNSpace, ThreeIdURN } from '.'
import { AddressType } from '../types/address'

export type IDRefURN = ThreeIdURN<`idref/${string}`>
export const IDRefURNSpace = <IDRefType extends AddressType>(
  idsrc: IDRefType
) => createThreeIdURNSpace<`idref:${IDRefType}`>(`idref:${idsrc}`)
