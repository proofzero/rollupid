import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'
import createAccountClient from '@kubelt/platform-clients/account'

import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
import { AccountURN, AccountURNSpace } from '@kubelt/urns/account'

import { Resolvers } from './typedefs'
import { Profile } from '@kubelt/platform.account/src/types'
import Env from '../../env'
import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../packages/alchemy-client'

import { PlatformJWTAssertionHeader } from '@kubelt/types/headers'

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
      console.log(
        `galaxy.contractsForAddress: getting contracts for account: ${owner}`
      )
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
  },

  Mutation: {},
}

const NFTsResolverComposition = {
  'Query.nftsForAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.contractsForAddress': [setupContext(), hasApiKey(), logAnalytics()],
  'Query.getNFTMetadataBatch': [setupContext(), logAnalytics()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
