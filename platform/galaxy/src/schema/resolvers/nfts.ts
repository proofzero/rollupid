import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'

import { Resolvers } from './typedefs'
import Env from '../../env'

import {
  AlchemyClient,
  AlchemyClientConfig,
  GetNFTsParams,
} from '../../../../../packages/alchemy-client'

import { setupContext } from './utils'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

const nftsResolvers: Resolvers = {
  Query: {
    // TODO: apply typing to the resolver:
    //@ts-ignore
    nftsForAddress: async (
      _parent: any,
      {
        owner,
        pageKey,
        pageSize,
        contractAddresses,
      }: {
        owner: string
        pageKey: string
        pageSize: number
        contractAddresses: string[]
      },
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      // console.log('owner', owner)
      // console.log('pageKey', pageKey)
      // console.log('pageSize', pageSize)

      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_KEY,
        chain: env.ALCHEMY_CHAIN,
        network: env.ALCHEMY_NETWORK,
      } as AlchemyClientConfig)

      try {
        let alchemyRes = (await alchemyClient.getNFTs({
          owner,
          pageKey,
          pageSize,
          contractAddresses,
        } as GetNFTsParams)) as any

        const ownedNfts = alchemyRes.ownedNfts.map((nft: any) => {
          let properties: {
            name: string
            value: any
            display: string
          }[] = []

          // TODO: is this here b/c pfp does not conform to standard?
          if (nft.metadata?.properties) {
            const validProps = Object.keys(nft.metadata.properties)
              .filter((k) => typeof nft.metadata.properties[k] !== 'object')
              .map((k) => ({
                name: k,
                value: nft.metadata.properties[k],
                display: typeof nft.metadata.properties[k],
              }))

            properties = properties.concat(validProps)
          }

          if (nft.metadata.attributes?.length) {
            const mappedAttributes = nft.metadata.attributes.map((a: any) => ({
              name: a.trait_type,
              value: a.value,
              display: a.display_type || 'string', // TODO: @Cosmin this field is not in the alchemy schema. Is it needed at all?
            }))

            properties = properties.concat(mappedAttributes)
          }

          nft.metadata.properties = properties

          return nft
        })

        alchemyRes.ownedNfts = ownedNfts

        return alchemyRes
      } catch (ex) {
        throw new GraphQLYogaError(ex as string)
      }
    },
  },
  Mutation: {},
}

const NFTsResolverComposition = {
  'Query.nftsForAddress': [setupContext()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
