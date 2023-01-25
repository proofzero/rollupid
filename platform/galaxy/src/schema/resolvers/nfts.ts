import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AccountURNSpace } from '@kubelt/urns/account'

import { Resolvers } from './typedefs'
import Env from '../../env'
import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../packages/alchemy-client'

import {
  hasApiKey,
  setupContext,
  sliceIntoChunks,
  logAnalytics,
  logNFTBatchAnalytics,
  getAllNfts,
  getAlchemyClients,
  nftBatchesFetcher,
  beautifyContracts,
  getConnectedCryptoAddresses,
  fetchContracts,
} from './utils'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
  addressURN: AddressURN
}

const nftsResolvers: Resolvers = {
  Query: {
    // TODO: apply typing to the resolver:
    //@ts-ignore
    nftsForAddress: async (
      _parent: any,
      {
        owner,
        contractAddresses,
      }: {
        owner: string
        contractAddresses: string[]
      },
      { env, jwt }: ResolverContext
    ) => {
      logAnalytics(
        env.Analytics,
        'nftsForAddress',
        'query:gql',
        'BEFORE',
        owner
      )
      let ownedNfts: any[] = []

      const accountURN = AccountURNSpace.componentizedUrn(owner)

      const addresses = await getConnectedCryptoAddresses({
        accountURN,
        Account: env.Account,
        jwt,
      })

      try {
        const { ethereumClient, polygonClient } = getAlchemyClients({ env })

        const [ethNfts, polyNfts] = await Promise.all([
          getAllNfts(ethereumClient, addresses, contractAddresses),
          getAllNfts(polygonClient, addresses, contractAddresses),
        ])

        ownedNfts = ownedNfts.concat(ethNfts, polyNfts)
      } catch (ex) {
        console.error(new GraphQLYogaError(ex as string))
      }

      ownedNfts = ownedNfts.sort((a, b) =>
        (a.contractMetadata?.name ?? '').localeCompare(
          b.contractMetadata?.name ?? ''
        )
      )

      return {
        ownedNfts,
      }
    },
    //@ts-ignore
    contractsForAddress: async (
      _parent: any,
      {
        owner,
        excludeFilters = ['SPAM', 'AIRDROPS'],
        pageSize = 1,
      }: {
        owner: string
        excludeFilters: string[]
        pageSize: number
      },
      { env, jwt }: ResolverContext
    ) => {
      let contracts: any[] = []

      const accountURN = AccountURNSpace.componentizedUrn(owner)

      const addresses = await getConnectedCryptoAddresses({
        accountURN,
        Account: env.Account,
        jwt,
      })

      try {
        const { ethereumClient, polygonClient } = getAlchemyClients({ env })

        const {
          ethereumContracts,
          polygonContracts,
        }: { ethereumContracts: any; polygonContracts: any } =
          await fetchContracts({
            addresses,
            ethereumClient,
            polygonClient,
            excludeFilters,
          })

        // This way in each nested collection we have its own Promise.all
        // And one common Promise.all on top of them.
        const [ethNFTs, polygonNFTs] = await Promise.all([
          Promise.all(
            await nftBatchesFetcher({
              contracts: ethereumContracts.contracts,
              addresses,
              alchemyClient: ethereumClient,
            })
          ),
          Promise.all(
            await nftBatchesFetcher({
              contracts: polygonContracts.contracts,
              addresses,
              alchemyClient: polygonClient,
            })
          ),
        ])

        ethereumContracts.contracts = beautifyContracts({
          nfts: ethNFTs,
          chain: AlchemyChain.ethereum,
          contracts: ethereumContracts.contracts,
          network: env.ALCHEMY_ETH_NETWORK,
        })
        polygonContracts.contracts = beautifyContracts({
          nfts: polygonNFTs,
          chain: AlchemyChain.polygon,
          network: env.ALCHEMY_POLYGON_NETWORK,
          contracts: polygonContracts.contracts,
        })

        contracts = ethereumContracts.contracts.concat(
          polygonContracts.contracts
        )
      } catch (ex) {
        console.error(new GraphQLYogaError(ex as string))
      }
      return {
        contracts,
      }
    },

    //@ts-ignore
    getNFTMetadataBatch: async (
      _parent: any,
      {
        input,
      }: {
        input: {
          contractAddress: string
          tokenId: string
          tokenType: string
        }[]
      },
      { env }: ResolverContext
    ) => {
      let ownedNfts: any[] = []

      try {
        const { ethereumClient, polygonClient } = getAlchemyClients({ env })

        const [ethNfts, polyNfts] = await Promise.all([
          ethereumClient.getNFTMetadataBatch(input),
          polygonClient.getNFTMetadataBatch(input),
        ])

        ownedNfts = ownedNfts.concat(ethNfts, polyNfts)
      } catch (ex) {
        console.error(new GraphQLYogaError(ex as string))
      }

      return {
        ownedNfts: NFTPropertyMapper(ownedNfts.filter((nft) => !nft.error)),
      }
    },

    //@ts-ignore
    getCuratedGallery: async (
      _parent: any,
      { addressURN }: { addressURN: AddressURN },
      { env }: ResolverContext
    ) => {
      const indexerClient = createIndexerClient(env.Indexer)

      let gallery: any = []

      try {
        gallery = await indexerClient.kb_getGallery([
          `urn:threeid:address/${AddressURNSpace.parse(addressURN).decoded}`,
        ])
      } catch (ex) {
        console.error(ex)
      }

      // TODO: fetch from account
      return {
        gallery: [],
      }
    },
  },

  Mutation: {
    //@ts-ignore
    updateCuratedGallery: async (
      _parent: any,
      { gallery }: { gallery: any[] },
      { env, jwt, addressURN }: ResolverContext
    ) => {
      const indexerClient = createIndexerClient(env.Indexer)

      // TODO: Return the gallery we've created. Need to enforce
      // the GraphQL types when setting data otherwise we're able
      // to set a value that can't be returned.
      try {
        await indexerClient.kb_setGallery(
          gallery.map((nft) => ({ ...nft, addressURN: '1' }))
        )
      } catch (ex) {
        console.error(ex)
      }

      return true
    },
  },
}

const NFTsResolverComposition = {
  'Query.nftsForAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.contractsForAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.getNFTMetadataBatch': [setupContext(), logAnalytics()],
  'Query.getCuratedGallery': [setupContext(), logAnalytics()],
  'Mutation.updateCuratedGallery': [setupContext(), logAnalytics()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
