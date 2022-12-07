import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'

import { Resolvers } from './typedefs'
import Env from '../../env'

import {
  AlchemyClient,
  AlchemyClientConfig,
  GetNFTsParams,
  GetContractsForOwnerParams,
  NFTPropertyMapper,
} from '../../../../../packages/alchemy-client'

import { setupContext } from './utils'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

const getAllNfts = async (
  alchemyClient: AlchemyClient,
  owner: string,
  contractAddresses: string[]
) => {
  let nfts: any[] = []

  let pageKey
  do {
    const res = (await alchemyClient.getNFTs({
      owner,
      contractAddresses,
      pageKey,
    })) as {
      ownedNfts: any[]
      pageKey: string | undefined
    }

    nfts = nfts.concat(NFTPropertyMapper(res.ownedNfts))

    pageKey = res.pageKey
  } while (pageKey)

  return nfts
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
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      const ethClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_ETH_KEY,
        chain: 'eth',
        network: env.ALCHEMY_ETH_NETWORK,
      } as AlchemyClientConfig)

      const polyClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_POLYGON_KEY,
        chain: 'polygon',
        network: env.ALCHEMY_POLYGON_NETWORK,
      } as AlchemyClientConfig)

      let ownedNfts: any[] = []

      try {
        const ethNfts = await getAllNfts(ethClient, owner, contractAddresses)
        const polyNfts = await getAllNfts(polyClient, owner, contractAddresses)

        ownedNfts = ownedNfts.concat(ethNfts, polyNfts)
      } catch (ex) {
        console.error(new GraphQLYogaError(ex as string))
      }

      return {
        ownedNfts,
      }
    },
    //@ts-ignore
    nftsForAddressContracts: async (
      _parent: any,
      {
        owner,
        excludeFilters,
        pageSize = 1,
      }: {
        owner: string
        excludeFilters: string[]
        pageSize: number
      },
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      let contracts: any[] = []

      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_ETH_KEY,
        chain: 'eth',
        network: env.ALCHEMY_ETH_NETWORK,
      } as AlchemyClientConfig)

      const alchemyPolygonClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_POLYGON_KEY,
        chain: 'polygon',
        network: 'mainnet', //env.ALCHEMY_POLYGON_NETWORK,
      } as AlchemyClientConfig)

      try {
        const [ethContracts, polygonContracts]: [any, any] = await Promise.all([
          alchemyClient.getContractsForOwner({ owner }),
          alchemyPolygonClient.getContractsForOwner({ owner }),
        ])

        const ethContractsAddresses = ethContracts.contracts.map(
          (contract: any) => contract.address
        )

        const polygonContractsAddresses = polygonContracts.contracts.map(
          (contract: any) => contract.address
        )

        // TODO: Max limit on Alchemy is 45 contract addresses per request.
        // Gotta go over the limit
        const [ethNFTs, polygonNFTs]: [any, any] = await Promise.all([
          // 1 NFT per contract
          alchemyClient.getNFTs({
            owner,
            contractAddresses: ethContractsAddresses,
            pageSize,
          }),
          alchemyPolygonClient.getNFTs({
            owner,
            contractAddresses: polygonContractsAddresses,
            pageSize,
          }),
        ])

        const ethCollectionsHashMap: any = {}
        const polyCollectionsHashMap: any = {}

        ethNFTs.ownedNfts = NFTPropertyMapper(ethNFTs.ownedNfts)
        polygonNFTs.ownedNfts = NFTPropertyMapper(polygonNFTs.ownedNfts)

        ethNFTs.ownedNfts.forEach((NFT: any) => {
          if (
            ethCollectionsHashMap[`${NFT.contract.address}`] &&
            ethCollectionsHashMap[`${NFT.contract.address}`].length
          ) {
            ethCollectionsHashMap[`${NFT.contract.address}`].push(NFT)
          } else {
            ethCollectionsHashMap[`${NFT.contract.address}`] = [NFT]
          }
        })

        polygonNFTs.ownedNfts.forEach((NFT: any) => {
          if (
            polyCollectionsHashMap[`${NFT.contract.address}`] &&
            polyCollectionsHashMap[`${NFT.contract.address}`].length
          ) {
            polyCollectionsHashMap[`${NFT.contract.address}`].push(NFT)
          } else {
            polyCollectionsHashMap[`${NFT.contract.address}`] = [NFT]
          }
        })

        ethContracts.contracts.forEach((contract: any) => {
          contract.ownedNfts = ethCollectionsHashMap[`${contract.address}`]
          contract.chain = { chain: 'eth', network: env.ALCHEMY_ETH_NETWORK }
        })
        polygonContracts.contracts.forEach((contract: any) => {
          contract.ownedNfts = polyCollectionsHashMap[`${contract.address}`]
          contract.chain = {
            chain: 'polygon',
            network: env.ALCHEMY_POLYGON_NETWORK,
          }
        })
        contracts = ethContracts.contracts.concat(polygonContracts.contracts)
      } catch (ex) {
        console.error(new GraphQLYogaError(ex as string))
      }
      return {
        contracts,
      }
    },
    //@ts-ignore
    contractsForAddress: async (
      _parent: any,
      {
        owner,
        pageKey,
        pageSize,
        excludeFilters,
      }: {
        owner: string
        pageKey: string
        pageSize: number
        excludeFilters: string[]
      },
      { env }: ResolverContext
    ) => {
      if (!owner) throw `Error: missing required argument 'owner'`

      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_ETH_KEY,
        chain: 'eth',
        network: env.ALCHEMY_ETH_NETWORK,
      } as AlchemyClientConfig)

      const alchemyPolygonClient: AlchemyClient = new AlchemyClient({
        key: env.ALCHEMY_POLYGON_KEY,
        chain: 'polygon',
        network: env.ALCHEMY_POLYGON_NETWORK,
      } as AlchemyClientConfig)

      // TODO: We need to reconsider pagination
      // here also
      let alchemyRes, alchemyPolygonRes
      try {
        ;[alchemyRes, alchemyPolygonRes] = await Promise.all([
          alchemyClient.getContractsForOwner({
            owner,
            pageKey,
            pageSize,
            excludeFilters,
          } as GetContractsForOwnerParams) as any,
          alchemyPolygonClient.getContractsForOwner({
            owner,
            pageKey,
            pageSize,
            excludeFilters,
          } as GetContractsForOwnerParams) as any,
        ])
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
  'Query.contractsForAddress': [setupContext()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
