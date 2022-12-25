import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'
import { z } from 'zod'
import { Context } from '../../context'

export type SetTokenMetadataParams = {
  tokenId: string,
  contract: string,
  metadata: string
}

export const SetTokenMetadataInput = z.object({
  tokenId: z.string(),
  contract: z.string(),
  metadata: z.string(),
})

export const setTokenMetadataMethod = async ({
  input,
  ctx,
}: {
  input: SetTokenMetadataParams
  ctx: Context
}) => {
  
  const metadataObj = JSON.parse(input.metadata)
  // TODO: save metadata to R2

  return null
}
