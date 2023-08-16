import { z } from 'zod'
import { AccountListSchema } from './jsonrpc/validators/accountList'
import { ProfileSchema } from './jsonrpc/validators/profile'
import { AccountsSchema } from './jsonrpc/validators/profile'
import { GetStripePaymentDataOutputSchema } from './jsonrpc/methods/stripePaymentData'

// TODO: move to types packages
export type AccountList = z.infer<typeof AccountListSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Accounts = z.infer<typeof AccountsSchema>
export type StripePaymentData = z.infer<typeof GetStripePaymentDataOutputSchema>
