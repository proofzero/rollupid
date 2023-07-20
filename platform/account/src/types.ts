import { z } from 'zod'
import { AddressListSchema } from './jsonrpc/validators/addressList'
import { ProfileSchema } from './jsonrpc/validators/profile'
import { AddressesSchema } from './jsonrpc/validators/profile'
import { GetStripePaymentDataOutputSchema } from './jsonrpc/methods/stripePaymentData'

// TODO: move to types packages
export type AddressList = z.infer<typeof AddressListSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Addresses = z.infer<typeof AddressesSchema>
export type StripePaymentData = z.infer<typeof GetStripePaymentDataOutputSchema>
