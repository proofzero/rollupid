import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import type { Context } from '../context'
import { Analytics } from '@proofzero/platform-middleware/analytics'
import { LogUsage } from '@proofzero/platform-middleware/log'
import {
  CancelServicePlansInput,
  cancelServicePlans,
} from './methods/cancelServicePlans'
import {
  GetStripPaymentDataInputSchema,
  GetStripePaymentDataOutputSchema,
  getStripePaymentData,
  SetStripePaymentDataInputSchema,
  setStripePaymentData,
} from './methods/stripePaymentData'
import {
  UpdateEntitlementsInputSchema,
  updateEntitlements,
} from './methods/updateEntitlements'
import {
  GetEntitlementsInputSchema,
  GetEntitlementsOutputSchema,
  getEntitlements,
} from './methods/getEntitlements'
import {
  GetIdentityGroupSeatsInputSchema,
  GetIdentityGroupSeatsOutputSchema,
  getIdentityGroupSeats,
} from './methods/getIdentityGroupSeats'
import {
  UpdateIdentityGroupSeatsInputSchema,
  updateIdentityGroupSeats,
} from './methods/updateIdentityGroupSeats'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  getEntitlements: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetEntitlementsInputSchema)
    .output(GetEntitlementsOutputSchema)
    .query(getEntitlements),
  updateEntitlements: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(UpdateEntitlementsInputSchema)
    .mutation(updateEntitlements),
  getStripePaymentData: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetStripPaymentDataInputSchema)
    .output(GetStripePaymentDataOutputSchema)
    .query(getStripePaymentData),
  setStripePaymentData: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(SetStripePaymentDataInputSchema)
    .mutation(setStripePaymentData),
  cancelServicePlans: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(CancelServicePlansInput)
    .mutation(cancelServicePlans),
  getIdentityGroupSeats: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(GetIdentityGroupSeatsInputSchema)
    .output(GetIdentityGroupSeatsOutputSchema)
    .query(getIdentityGroupSeats),
  updateIdentityGroupSeats: t.procedure
    .use(LogUsage)
    .use(Analytics)
    .input(UpdateIdentityGroupSeatsInputSchema)
    .mutation(updateIdentityGroupSeats),
})
