import { GraphQLYogaError } from '@graphql-yoga/common'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../../packages/alchemy-client'

import Env from '../../../env'

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

type AlchemyNfts = {
  ownedNfts: Nft[]
  blockHash: string
  totalCount: number
}

type contracts = {
  contracts: NftContract[]
  totalCount: number
  chain?: {
    network: string
    chain: string
  }
}

// list of NFT contracts
type NftBatch = string[]

import type { Nft, NftContract } from '../typedefs'

export const getAllNfts = async (
  alchemyClient: AlchemyClient,
  addresses: string[],
  contractAddresses: string[],
  maxRuns: number = 3
) => {
  let nfts: Nft[] = []

  await Promise.all(
    addresses.map(async (address) => {
      let runs = 0
      let pageKey
      do {
        const res = (await alchemyClient.getNFTs({
          owner: address,
          contractAddresses,
          pageKey,
        })) as {
          ownedNfts: Nft[]
          pageKey: string | undefined
        }

        nfts = nfts.concat(NFTPropertyMapper(res.ownedNfts))

        pageKey = res.pageKey
      } while (pageKey && ++runs <= maxRuns)
    })
  )
  const chain = await alchemyClient.getChain()

  nfts = nfts.map((nft) => ({ ...nft, chain }))

  return nfts
}

export const getAlchemyClients = ({ env }: { env: ResolverContext['env'] }) => {
  return {
    ethereumClient: new AlchemyClient({
      key: env.APIKEY_ALCHEMY_ETH,
      network: env.ALCHEMY_ETH_NETWORK,
      chain: AlchemyChain.ethereum,
    } as AlchemyClientConfig),
    polygonClient: new AlchemyClient({
      key: env.APIKEY_ALCHEMY_POLYGON,
      network: env.ALCHEMY_POLYGON_NETWORK,
      chain: AlchemyChain.polygon,
    } as AlchemyClientConfig),
  }
}

export const nftBatchesFetcher = async ({
  contracts,
  addresses,
  alchemyClient,
}: {
  contracts: NftContract[]
  addresses: string[]
  alchemyClient: AlchemyClient
}) => {
  // Max limit on Alchemy is 45 contract addresses per request.
  // We need batches with 45 contracts in each

  const batches = sliceIntoChunks(
    contracts.map((contract: NftContract) => contract.address),
    45
  )

  // Promise.all only to avoid promise chains
  // TODO: chang to async npm package
  const res = await Promise.all(
    batches.map(async (batch: NftBatch) => {
      const visitedMap = new Map()
      batch.forEach((contract: string) => {
        visitedMap.set(contract, true)
      })
      const result: Nft[] = []
      let localBatch = Array.from(visitedMap.keys())
      while (localBatch.length > 0) {
        try {
          // We have multiple batches and multiple addresses
          // Essentially we need to mapreduce through them all
          // - that's why we have nested cycles
          // then we need to combine nfts in one object - thats why we are using
          // refuce after
          const nfts: AlchemyNfts = (
            await Promise.all(
              addresses.map(async (address) => {
                const currentNfts = await alchemyClient.getNFTs({
                  owner: address,
                  contractAddresses: localBatch,
                  pageSize: localBatch.length * 3,
                })
                return currentNfts as AlchemyNfts
              })
            )
          ).reduce(
            (acc, contract) => {
              return {
                ownedNfts: acc.ownedNfts.concat(contract.ownedNfts),
                // they all have same blockHash
                blockHash: contract.blockHash,
                totalCount: contract.totalCount + acc.totalCount,
              }
            },
            { ownedNfts: [], blockHash: '', totalCount: 0 }
          )
          nfts.ownedNfts.forEach((nft: Nft) => {
            visitedMap.delete(nft.contract?.address)
          })
          localBatch = Array.from(visitedMap.keys())

          result.push(...nfts.ownedNfts)
        } catch (ex) {
          console.error(new GraphQLYogaError(ex as string))
          break
        }
      }

      return result
    })
  )

  return res.length ? res[0].flat() : []
}

export function sliceIntoChunks(arr: any[], chunkSize: number) {
  const res = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    res.push(chunk)
  }
  return res
}

export const beautifyContracts = ({
  nfts,
  chain,
  contracts,
  network,
}: {
  nfts: Nft[]
  chain: string
  contracts: NftContract[]
  network: string
}) => {
  let ownedNfts: Nft[] = []

  nfts.forEach((nft: Nft) => {
    ownedNfts.push(nft)
  })

  const collectionsHashMap = new Map()
  ownedNfts = NFTPropertyMapper(ownedNfts.flat())

  // Creating hashmap with contract addresses as keys
  // And nft arrays as values

  ownedNfts.forEach((NFT: Nft) => {
    NFT.chain = { chain, network }
    if (
      collectionsHashMap.has(NFT.contract?.address) &&
      collectionsHashMap.get(NFT.contract?.address).length
    ) {
      collectionsHashMap.set(NFT.contract?.address, [
        ...collectionsHashMap.get(NFT.contract?.address),
        NFT,
      ])
    } else {
      collectionsHashMap.set(NFT.contract?.address, [NFT])
    }
  })

  // Attach NFT array to a contract object
  // With hash map key it is easy to find a needed array to specific
  // collection
  const beautifiedContracts = contracts.map((contract: NftContract) => {
    return {
      ...contract,
      ownedNfts: collectionsHashMap.get(contract.address),
      chain: { chain, network },
    }
  })

  return beautifiedContracts
}

export const fetchContracts = async ({
  addresses,
  ethereumClient,
  polygonClient,
  excludeFilters,
}: {
  addresses: string[]
  ethereumClient: AlchemyClient
  polygonClient: AlchemyClient
  excludeFilters: string[]
}) => {
  const [ethContracts, polyContracts]: [
    { contracts: NftContract[]; totalCount: number }[],
    { contracts: NftContract[]; totalCount: number }[]
  ] = await Promise.all([
    Promise.all(
      addresses.map(
        async (address) =>
          await ethereumClient.getContractsForOwner({
            address,
            excludeFilters,
          })
      )
    ),
    Promise.all(
      addresses.map(
        async (address) =>
          await polygonClient.getContractsForOwner({
            address,
            excludeFilters,
          })
      )
    ),
  ])

  const ethereumContracts: contracts = ethContracts.reduce(
    (acc, instance) => {
      return {
        contracts: acc.contracts.concat(instance.contracts),
        totalCount: acc.totalCount + instance.totalCount,
      }
    },
    {
      contracts: [],
      totalCount: 0,
    }
  )

  ethereumContracts.chain = {
    network: '',
    chain: AlchemyChain.ethereum,
  }

  const polygonContracts: contracts = polyContracts.reduce(
    (acc, instance) => {
      return {
        contracts: acc.contracts.concat(instance.contracts),
        totalCount: acc.totalCount + instance.totalCount,
      }
    },
    { contracts: [], totalCount: 0 }
  )

  return { ethereumContracts, polygonContracts }
}
