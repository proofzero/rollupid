import { z } from 'zod'
import { AddressURNInput } from '@proofzero/platform-middleware/inputValidators'
import { Context } from '../../context'
import { AddressURN } from '@proofzero/urns/address'

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
  let node = await ctx.edges.findNode.query({
    qc: {
      alias: input,
    },
  })

  if (!node) {
    node = await ctx.edges.findNode.query({
      qc: {
        alias: input.toLowerCase(),
      },
    })
  }

  return node?.baseUrn as AddressURN
}
