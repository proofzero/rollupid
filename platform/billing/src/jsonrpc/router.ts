import { initTRPC } from '@trpc/server'

import { errorFormatter } from '@proofzero/utils/trpc'

import type { Context } from '../context'
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
import {
  SetPaymentFailedInput,
  setPaymentFailed,
} from './methods/setPaymentFailed'
import {
  GetUsedIdentityGroupSeatsInputSchema,
  GetUsedIdentityGroupSeatsOutputSchema,
  getUsedIdentityGroupSeats,
} from './methods/getUsedIdentityGroupSeats'

const t = initTRPC.context<Context>().create({ errorFormatter })

export const appRouter = t.router({
  getEntitlements: t.procedure
    .use(LogUsage)
    .input(GetEntitlementsInputSchema)
    .output(GetEntitlementsOutputSchema)
    .query(getEntitlements),
  updateEntitlements: t.procedure
    .use(LogUsage)
    .input(UpdateEntitlementsInputSchema)
    .mutation(updateEntitlements),
  getStripePaymentData: t.procedure
    .use(LogUsage)
    .input(GetStripPaymentDataInputSchema)
    .output(GetStripePaymentDataOutputSchema)
    .query(getStripePaymentData),
  setStripePaymentData: t.procedure
    .use(LogUsage)
    .input(SetStripePaymentDataInputSchema)
    .mutation(setStripePaymentData),
  cancelServicePlans: t.procedure
    .use(LogUsage)
    .input(CancelServicePlansInput)
    .mutation(cancelServicePlans),
  getUsedIdentityGroupSeats: t.procedure
    .use(LogUsage)
    .input(GetUsedIdentityGroupSeatsInputSchema)
    .output(GetUsedIdentityGroupSeatsOutputSchema)
    .query(getUsedIdentityGroupSeats),
  getIdentityGroupSeats: t.procedure
    .use(LogUsage)
    .input(GetIdentityGroupSeatsInputSchema)
    .output(GetIdentityGroupSeatsOutputSchema)
    .query(getIdentityGroupSeats),
  updateIdentityGroupSeats: t.procedure
    .use(LogUsage)
    .input(UpdateIdentityGroupSeatsInputSchema)
    .mutation(updateIdentityGroupSeats),
  setPaymentFailed: t.procedure
    .use(LogUsage)
    .input(SetPaymentFailedInput)
    .mutation(setPaymentFailed),
})
