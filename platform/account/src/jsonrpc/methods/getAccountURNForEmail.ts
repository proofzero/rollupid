import { z } from 'zod'

import { AccountURN } from '@proofzero/urns/account'

import { router } from '@proofzero/platform.core'
import { AccountURNInput } from '@proofzero/platform-middleware/inputValidators'

import { Context } from '../../context'

export const GetAccountURNForEmailInputSchema = z.string().email()
type GetAccountURNForEmailParams = z.infer<
  typeof GetAccountURNForEmailInputSchema
>

export const GetAccountURNForEmailOutputSchema = AccountURNInput.optional()
type GetAccountURNForEmailResult = z.infer<
  typeof GetAccountURNForEmailOutputSchema
>

export const getAccountURNForEmailMethod = async ({
  ctx,
  input,
}: {
  ctx: Context
  input: GetAccountURNForEmailParams
}): Promise<GetAccountURNForEmailResult> => {
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
  return node.length > 0 ? (node[0]?.baseUrn as AccountURN) : undefined
}
