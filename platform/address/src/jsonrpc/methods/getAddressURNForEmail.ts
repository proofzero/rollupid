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

  let node = await caller.edges.findNodeBatch([
    {
      qc: {
        alias: input,
      },
    },
  ])

  if (!node) {
    node = await caller.edges.findNodeBatch([
      {
        qc: {
          alias: input.toLowerCase(),
        },
      },
    ])
  }

  //We return first urn
  return node.length > 0 ? (node[0]?.baseUrn as AddressURN) : undefined
}
