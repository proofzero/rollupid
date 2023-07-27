import { z } from 'zod'

import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

import { router } from '@proofzero/platform.core'
import {
  AccountURNInput,
  AddressURNInput,
} from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'
import { initAccountNodeByName } from '../../nodes'

export const GetStripPaymentDataInputSchema = z.object({
  accountURN: AccountURNInput,
})
type GetStripPaymentDataInput = z.infer<typeof GetStripPaymentDataInputSchema>

export const GetStripePaymentDataOutputSchema = z
  .object({
    customerID: z.string(),
    email: z.string(),
    name: z.string(),
    paymentMethodID: z.string().optional(),
    addressURN: AddressURNInput.optional(),
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
  const account = await initAccountNodeByName(input.accountURN, ctx.Account)

  return account.class.getStripePaymentData()
}

export const SetStripePaymentDataInputSchema = z.object({
  customerID: z.string(),
  paymentMethodID: z.string().optional(),
  accountURN: AccountURNInput,
  name: z.string(),
  email: z.string(),
  addressURN: AddressURNInput,
})
type SetStripePaymentDataInput = z.infer<typeof SetStripePaymentDataInputSchema>

export const setStripePaymentData = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: SetStripePaymentDataInput
}): Promise<void> => {
  const account = await initAccountNodeByName(input.accountURN, ctx.Account)

  const { customerID, paymentMethodID, email, name, accountURN, addressURN } =
    input

  await account.class.setStripePaymentData({
    customerID,
    paymentMethodID,
    email,
    addressURN,
    name,
  })

  const caller = router.createCaller(ctx)

  if (addressURN) {
    const { edges } = await caller.edges.getEdges({
      query: {
        src: { baseUrn: accountURN },
        tag: EDGE_HAS_REFERENCE_TO,
      },
    })

    if (edges.length > 1) {
      console.warn(`More than one edge found for ${accountURN} -> address`)
    }

    for (const edge of edges) {
      await caller.edges.removeEdge({
        tag: EDGE_HAS_REFERENCE_TO,
        src: edge.src.baseUrn,
        dst: edge.dst.baseUrn,
      })
    }

    await caller.edges.makeEdge({
      src: accountURN,
      dst: addressURN,
      tag: EDGE_HAS_REFERENCE_TO,
    })
  }
}
