import { z } from 'zod'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

export const AddressURNInput = z.custom<AddressURN>((input) => {
  if (AddressURNSpace.parse(input as AddressURN) === null) {
    console.log("AddressURNInput: input didn't parse")
    throw new Error('Invalid AddressURN entry')
  }
  return input
})
