import { z } from 'zod'

import { AddressURN } from '@proofzero/urns/address'

import { router } from '@proofzero/platform.core'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'

export const GetAddressURNForEmailInputSchema = z.string().email()
type GetAddressURNForEmailParams = z.infer<
  typeof GetAddressURNForEmailInputSchema
>

export const GetAddressURNForEmailOutputSchema = AddressURNInput.optional()
type GetAddressURNForEmailResult = z.infer<
  typeof GetAddressURNForEmailOutputSchema
>

export const getAddressURNForEmailMethod = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: GetAddressURNForEmailParams
}): Promise<GetAddressURNForEmailResult> => {
  const caller = router.createCaller(ctx)

  let node = await caller.edges.findNode({
    qc: {
      alias: input,
    },
  })

  if (!node) {
    node = await caller.edges.findNode({
      qc: {
        alias: input.toLowerCase(),
      },
    })
  }

  return node?.baseUrn as AddressURN
}
