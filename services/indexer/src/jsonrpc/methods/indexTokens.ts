import { z } from 'zod'
import Core from '@moralisweb3/common-core'
import EvmApi from '@moralisweb3/evm-api'

import { Context } from '../../context'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AddressURNInput } from '../middlewares/inputValidators'
import { SetTokenMetadataParams } from './setTokenMetadata'
import { TokensTable } from '../../db/schema'

export type IndexTokenParams = {
  address: AddressURN
  chain: string
  cursor?: string
}

export const IndexTokenInput = z.object({
  address: AddressURNInput,
  chain: z.string(),
  cursor: z.string().optional(),
})

export const indexTokenMethod = async ({
  input,
  ctx,
}: {
  input: IndexTokenParams
  ctx: Context
}) => {
  const address = AddressURNSpace.decode(input.address)

  const core = Core.create()
  await core.start({ apiKey: ctx.APIKEY_MORALIS })
  core.registerModules([EvmApi])

  const evmApi = core.getModule<EvmApi>(EvmApi.moduleName)
  const res = await evmApi.nft.getWalletNFTs({
    address,
    chain: input.chain,
    cursor: input.cursor,
    normalizeMetadata: true,
  })

  if (res.pagination.cursor) {
    ctx.BLOCKCHAIN_ACTIVITY?.send({
      method: 'kb_indexTokens',
      body: [input.address, input.chain, res.pagination.cursor],
    })
    // alternatively we could use just do a loop with
    // res.hasNext and res.next() to fetch next page
  }

  const tokenValues: TokensTable[] = []
  const contractMap: Record<string, string> = {}
  const messages: { method: string; body: SetTokenMetadataParams }[] = []
  for (const nft of res.result) {
    const contract = nft.tokenAddress.lowercase
    const tokenId = nft.result.tokenId.toString()
    const token = {
      tokenId,
      contract,
      addressURN: input.address,
    }
    tokenValues.push(token)
    contractMap[contract] = nft.name || ''

    const metadata = nft.metadata?.toString()
    console.log({ token, metadata })
    if (metadata) {
      messages.push({
        method: 'kb_setTokenMetadata',
        body: { tokenId, contract, metadata },
      })
    }
  }

  // ctx.BLOCKCHAIN_ACTIVITY?.sendBatch(messages)

  const upsertGallery = await ctx.COLLECTIONS?.prepare(
    `INSERT INTO tokens (tokenId, contract, addressURN) 
      VALUES ${tokenValues} ON CONFLICT (tokenId, contract) 
      DO UPDATE SET addressURN = excluded.addressURN, gallery_order = null`
  ).all()

  // const upsertGallery = await db
  //   .insert(tokens)
  //   .values(...tokenValues)
  //   .onConflictDoUpdate({
  //     where: sql`addressURN != excluded.addressURN`,
  //     set: {
  //       gallery_order: null,
  //       addressURN: sql`excluded.addressURN`,
  //     },
  //   })
  //   .run()

  console.log({ upsertGallery })

  const contractValues = Object.entries(contractMap).map(
    ([contract, name]) => ({
      contract,
      name,
    })
  )

  const insertCollections = await ctx.COLLECTIONS?.prepare(
    `INSERT INTO collections (contract, name) 
      VALUES ${contractValues} 
      ON CONFLICT (contract) DO NOTHING`
  ).all()

  // const insertCollections = await db
  //   .insert(collections)
  //   .values(...contractValues) // should ignore duplicates
  //   .run()

  console.log({ insertCollections })

  return null
}
