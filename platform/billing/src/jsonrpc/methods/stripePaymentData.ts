import { z } from 'zod'

import { EDGE_HAS_REFERENCE_TO } from '@proofzero/types/graph'

import { router } from '@proofzero/platform.core'

import { Context } from '../../context'
import {
  AccountURNInput,
  AnyURNInput,
} from '@proofzero/platform-middleware/inputValidators'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import {
  initIdentityGroupNodeByName,
  initIdentityNodeByName,
} from '../../../../identity/src/nodes'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { BadRequestError } from '@proofzero/errors'

export const GetStripPaymentDataInputSchema = z.object({
  URN: AnyURNInput,
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
  let ownerNode
  if (IdentityURNSpace.is(input.URN)) {
    ownerNode = initIdentityNodeByName(input.URN, ctx.Account)
  } else if (IdentityGroupURNSpace.is(input.URN)) {
    ownerNode = initIdentityGroupNodeByName(input.URN, ctx.IdentityGroup)
  } else {
    throw new BadRequestError({
      message: `URN type not supported`,
    })
  }

  return ownerNode.class.getStripePaymentData()
}

export const SetStripePaymentDataInputSchema = z.object({
  URN: AnyURNInput,
  customerID: z.string(),
  paymentMethodID: z.string().optional(),
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
  let ownerNode
  if (IdentityURNSpace.is(input.URN)) {
    ownerNode = initIdentityNodeByName(input.URN, ctx.Account)
  } else if (IdentityGroupURNSpace.is(input.URN)) {
    ownerNode = initIdentityGroupNodeByName(input.URN, ctx.IdentityGroup)
  } else {
    throw new BadRequestError({
      message: `URN type not supported`,
    })
  }

  const { customerID, paymentMethodID, email, name, accountURN } = input

  await ownerNode.class.setStripePaymentData({
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
        src: { baseUrn: input.URN },
        tag: EDGE_HAS_REFERENCE_TO,
      },
    })

    if (edges.length > 1) {
      console.warn(`More than one edge found for ${input.URN} -> account`)
    }

    for (const edge of edges) {
      await caller.edges.removeEdge({
        tag: EDGE_HAS_REFERENCE_TO,
        src: edge.src.baseUrn,
        dst: edge.dst.baseUrn,
      })
    }

    await caller.edges.makeEdge({
      src: input.URN,
      tag: EDGE_HAS_REFERENCE_TO,
      dst: accountURN,
    })
  }
}
