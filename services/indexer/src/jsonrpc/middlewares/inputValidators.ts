import { z } from 'zod'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

export const AddressURNInput = z.custom<AddressURN>((input) => {
  if (AddressURNSpace.parse(input as AddressURN) === null) {
    throw new Error('Invalid AddressURN entry')
  }
})