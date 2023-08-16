import { z } from 'zod'
import { GetStripePaymentDataOutputSchema } from './jsonrpc/methods/stripePaymentData'

export type StripePaymentData = z.infer<typeof GetStripePaymentDataOutputSchema>
