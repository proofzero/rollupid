import Core from '@moralisweb3/common-core'
import EvmApi from '@moralisweb3/evm-api'

import * as openrpc from '@kubelt/openrpc'
import type { RpcRequest, RpcService } from '@kubelt/openrpc'

import { IndexRpcContext } from '../../types'
import { SetTokenMetadataParams } from './setTokenMetadata'
import { tokens, collections, TokensTable } from '../../db/schema'
import { sql } from 'drizzle-orm'
import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'

export type IndexTokenParams = [
  address: AddressURN,
  chain: string,
  cursor?: string
] // addresses

export default async (
  service: Readonly<RpcService>,
  request: Readonly<RpcRequest>,
  context: Readonly<IndexRpcContext>
) => {
  const [addressURN, chain, cursor] = request.params as IndexTokenParams
  const address = AddressURNSpace.decode(addressURN)

  const core = Core.create()
  await core.start({ apiKey: context.get('APIKEY_MORALIS') })
  core.registerModules([EvmApi])

  const evmApi = core.getModule<EvmApi>(EvmApi.moduleName)
  const res = await evmApi.nft.getWalletNFTs({
    address,
    chain,
    cursor,
    normalizeMetadata: true,
  })

  if (res.pagination.cursor) {
    context.get('BLOCKCHAIN_ACTIVITY').send({
      method: 'kb_indexTokens',
      body: [addressURN, chain, res.pagination.cursor],
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
      addressURN,
    }
    tokenValues.push(token)
    contractMap[contract] = nft.name || ''

    const metadata = nft.metadata?.toString()
    console.log({ token, metadata })
    if (metadata) {
      messages.push({
        method: 'kb_setTokenMetadata',
        body: [tokenId, contract, metadata],
      })
    }
  }

  context.get('BLOCKCHAIN_ACTIVITY').sendBatch(messages)

  const db = context.collectionDB
  const upsertGallery = await db
    .insert(tokens)
    .values(...tokenValues)
    .onConflictDoUpdate({
      where: sql`addressURN != excluded.addressURN`,
      set: {
        gallery_order: null,
        addressURN: sql`excluded.addressURN`,
      },
    })
    .run()

  console.log({ upsertGallery })

  const contractValues = Object.entries(contractMap).map(
    ([contract, name]) => ({
      contract,
      name,
    })
  )
  const insertCollections = await db
    .insert(collections)
    .values(...contractValues) // should ignore duplicates
    .run()

  console.log({ insertCollections })

  return openrpc.response(request, { tokens, contracts: contractMap })
}
