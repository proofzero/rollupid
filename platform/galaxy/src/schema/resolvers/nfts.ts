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

import { setupContext, sliceIntoChunks } from './utils'

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
        const [ethNfts, polyNfts] = await Promise.all([
          getAllNfts(ethClient, owner, contractAddresses),
          getAllNfts(polyClient, owner, contractAddresses),
        ])

        ownedNfts = ownedNfts.concat(ethNfts, polyNfts)
      } catch (ex) {
        console.error(new GraphQLYogaError(ex as string))
      }

      return {
        ownedNfts,
      }
    },
    //@ts-ignore
    contractsForAddress: async (
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
        network: env.ALCHEMY_POLYGON_NETWORK,
      } as AlchemyClientConfig)

      try {
        const [ethContracts, polygonContracts]: [any, any] = await Promise.all([
          alchemyClient.getContractsForOwner({
            owner,
            excludeFilters: ['SPAM'],
          }),
          alchemyPolygonClient.getContractsForOwner({
            owner,
            excludeFilters: ['SPAM'],
          }),
        ])

        console.log('EVEN HERE', ethContracts)

        const ethContractsAddresses = ethContracts.contracts.map(
          (contract: any) => contract.address
        )

        const polygonContractsAddresses = polygonContracts.contracts.map(
          (contract: any) => contract.address
        )

        let EthOwnedNfts: any[] = []
        let PolygonOwnedNfts: any[] = []

        // Max limit on Alchemy is 45 contract addresses per request.
        // We need batches with 45 contracts in each
        // DOESN'T WORK with vitalik.eth address
        // TODO: this case needs additional work
        if (
          ethContractsAddresses.length > 44 ||
          polygonContractsAddresses > 44
        ) {
          const ethBatches = sliceIntoChunks(ethContractsAddresses, 44)
          const polygonBatches = sliceIntoChunks(polygonContractsAddresses, 44)

          const ethNFTs: any = await Promise.all(
            ethBatches.map(async (batch) => {
              const res = await alchemyClient.getNFTs({
                owner,
                contractAddresses: batch,
                pageSize,
              })
              return res
            })
          )

          const polygonNFTs: any = await Promise.all(
            polygonBatches.map(async (batch) => {
              return await alchemyPolygonClient.getNFTs({
                owner,
                contractAddresses: batch,
                pageSize,
              })
            })
          )

          ethNFTs.forEach((batch: any) => {
            EthOwnedNfts.push(batch.ownedNfts[0])
          })
          polygonNFTs.forEach((batch: any) => {
            PolygonOwnedNfts.push(batch.ownedNfts[0])
          })
        } else {
          const [ethNFTs, polygonNFTs]: any = await Promise.all([
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
          EthOwnedNfts = ethNFTs.ownedNfts
          PolygonOwnedNfts = polygonNFTs.ownedNfts
        }
        const ethCollectionsHashMap: any = {}
        const polyCollectionsHashMap: any = {}

        EthOwnedNfts = NFTPropertyMapper(EthOwnedNfts)
        PolygonOwnedNfts = NFTPropertyMapper(PolygonOwnedNfts)

        EthOwnedNfts.forEach((NFT: any) => {
          NFT.chain = { chain: 'eth', network: env.ALCHEMY_ETH_NETWORK }
          if (
            ethCollectionsHashMap[`${NFT.contract.address}`] &&
            ethCollectionsHashMap[`${NFT.contract.address}`].length
          ) {
            ethCollectionsHashMap[`${NFT.contract.address}`].push(NFT)
          } else {
            ethCollectionsHashMap[`${NFT.contract.address}`] = [NFT]
          }
        })

        PolygonOwnedNfts.forEach((NFT: any) => {
          NFT.chain = { chain: 'polygon', network: env.ALCHEMY_ETH_NETWORK }
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
  },

  Mutation: {},
}

const NFTsResolverComposition = {
  'Query.nftsForAddress': [setupContext()],
  'Query.contractsForAddress': [setupContext()],
}

export default composeResolvers(nftsResolvers, NFTsResolverComposition)
