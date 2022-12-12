import { composeResolvers } from '@graphql-tools/resolvers-composition'
import { GraphQLYogaError } from '@graphql-yoga/common'

import { Resolvers } from './typedefs'
import Env from '../../env'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../packages/alchemy-client'

import { setupContext, sliceIntoChunks } from './utils'
import { print } from 'graphql'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

const getAllNfts = async (
  alchemyClient: AlchemyClient,
  owner: string,
  contractAddresses: string[],
  maxRuns: number = 3
) => {
  let nfts: any[] = []

  let runs = 0
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
  } while (pageKey && ++runs <= maxRuns)

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
      const ethClient: AlchemyClient = new AlchemyClient({
        key: env.APIKEY_ALCHEMY_ETH,
        chain: AlchemyChain.ethereum,
        network: env.ALCHEMY_ETH_NETWORK,
      } as AlchemyClientConfig)

      const polyClient: AlchemyClient = new AlchemyClient({
        key: env.APIKEY_ALCHEMY_POLYGON,
        chain: AlchemyChain.polygon,
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
      { env }: ResolverContext
    ) => {
      let contracts: any[] = []

      const alchemyClient: AlchemyClient = new AlchemyClient({
        key: env.APIKEY_ALCHEMY_ETH,
        chain: 'eth',
        network: env.ALCHEMY_ETH_NETWORK,
      } as AlchemyClientConfig)

      const alchemyPolygonClient: AlchemyClient = new AlchemyClient({
        key: env.APIKEY_ALCHEMY_POLYGON,
        chain: 'polygon',
        network: env.ALCHEMY_POLYGON_NETWORK,
      } as AlchemyClientConfig)

      try {
        const [ethContracts, polygonContracts]: [any, any] = await Promise.all([
          alchemyClient.getContractsForOwner({
            owner,
            excludeFilters,
          }),
          alchemyPolygonClient.getContractsForOwner({
            owner,
            excludeFilters,
          }),
        ])

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
        const ethBatches = sliceIntoChunks(ethContractsAddresses, 45)
        const polygonBatches = sliceIntoChunks(polygonContractsAddresses, 45)

        // This way in each nested collection we have its own Promise.all
        // And one common Promise.all on top of them.

        const [ethNFTs, polygonNFTs] = await Promise.all([
          await Promise.all(
            ethBatches.map(async (batch: any) => {
              const visitedMap: any = {}
              batch.forEach((contract: string) => {
                visitedMap[`${contract}`] = true
              })
              const res: any = []
              let localBatch = Object.keys(visitedMap)
              while (localBatch.length > 0) {
                let nfts: any = await alchemyClient.getNFTs({
                  owner,
                  contractAddresses: localBatch,
                  pageSize: localBatch.length * 3,
                })
                nfts.ownedNfts.forEach((nft: any) => {
                  delete visitedMap[`${nft.contract.address}`]
                })
                localBatch = Object.keys(visitedMap)
                res.push(nfts.ownedNfts)
              }
              return res
            })
          ),
          await Promise.all(
            polygonBatches.map(async (batch: any) => {
              const visitedMap: any = {}
              batch.forEach((contract: string) => {
                visitedMap[`${contract}`] = true
              })
              const res: any = []
              let localBatch = Object.keys(visitedMap)
              while (localBatch.length > 0) {
                let nfts: any = await alchemyPolygonClient.getNFTs({
                  owner,
                  contractAddresses: localBatch,
                  pageSize: localBatch.length * 3,
                })
                nfts.ownedNfts.forEach((nft: any) => {
                  delete visitedMap[`${nft.contract.address}`]
                })
                localBatch = Object.keys(visitedMap)
                res.push(nfts.ownedNfts)
              }
              return res
            })
          ),
        ])

        ethNFTs.forEach((batch: any) => {
          EthOwnedNfts.push(...batch)
        })
        polygonNFTs.forEach((batch: any) => {
          PolygonOwnedNfts.push(...batch)
        })

        const ethCollectionsHashMap: any = {}
        const polyCollectionsHashMap: any = {}
        // Mapper doesn't work on some vitaliks' nfts for
        // various reasons "Cannot create property 'properties' on string" - e.g.

        EthOwnedNfts = NFTPropertyMapper(EthOwnedNfts.flat())
        PolygonOwnedNfts = NFTPropertyMapper(PolygonOwnedNfts.flat())
        // Creating hashmap with contract addresses as keys
        // And nft arrays as values
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
        // Attach NFT array to a contract object
        // With hash map key it is easy to find a needed array to specific
        // collection
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
