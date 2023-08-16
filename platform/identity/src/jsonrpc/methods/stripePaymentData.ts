import { z } from 'zod'

import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

import { router } from '@proofzero/platform.core'
import {
  IdentityURNInput,
  AccountURNInput,
} from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { initIdentityNodeByName } from '../../nodes'

export const GetStripPaymentDataInputSchema = z.object({
  identityURN: IdentityURNInput,
})
type GetStripPaymentDataInput = z.infer<typeof GetStripPaymentDataInputSchema>

export const GetStripePaymentDataOutputSchema = z
  .object({
    customerID: z.string(),
    email: z.string(),
    name: z.string(),
    paymentMethodID: z.string().optional(),
    accountURN: AccountURNInput.optional(),
  })
  .optional()
type GetStripePaymentDataOutput = z.infer<
  typeof GetStripePaymentDataOutputSchema
>

export const getStripePaymentData = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: GetStripPaymentDataInput
}): Promise<GetStripePaymentDataOutput> => {
  const identity = await initIdentityNodeByName(input.identityURN, ctx.Identity)

  return identity.class.getStripePaymentData()
}

export const SetStripePaymentDataInputSchema = z.object({
  customerID: z.string(),
  paymentMethodID: z.string().optional(),
  identityURN: IdentityURNInput,
  name: z.string(),
  email: z.string(),
  accountURN: AccountURNInput,
})
type SetStripePaymentDataInput = z.infer<typeof SetStripePaymentDataInputSchema>

export const setStripePaymentData = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: SetStripePaymentDataInput
}): Promise<void> => {
  const identity = await initIdentityNodeByName(input.identityURN, ctx.Identity)

  const { customerID, paymentMethodID, email, name, identityURN, accountURN } =
    input

  await identity.class.setStripePaymentData({
    customerID,
    paymentMethodID,
    email,
    accountURN,
    name,
  })

  const caller = router.createCaller(ctx)

  if (accountURN) {
    const { edges } = await caller.edges.getEdges({
      query: {
        src: { baseUrn: identityURN },
        tag: EDGE_HAS_REFERENCE_TO,
      },
    })

    if (edges.length > 1) {
      console.warn(`More than one edge found for ${identityURN} -> account`)
    }

    for (const edge of edges) {
      await caller.edges.removeEdge({
        tag: EDGE_HAS_REFERENCE_TO,
        src: edge.src.baseUrn,
        dst: edge.dst.baseUrn,
      })
    }

    await caller.edges.makeEdge({
      src: identityURN,
      dst: accountURN,
      tag: EDGE_HAS_REFERENCE_TO,
    })
  }
}
