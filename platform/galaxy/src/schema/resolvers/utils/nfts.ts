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

export const getAllNfts = async (
  alchemyClient: AlchemyClient,
  addresses: string[],
  contractAddresses: string[],
  maxRuns: number = 3
) => {
  let nfts: any[] = []

  for (const address of addresses) {
    let runs = 0
    let pageKey
    do {
      const res = (await alchemyClient.getNFTs({
        owner: address,
        contractAddresses,
        pageKey,
      })) as {
        ownedNfts: any[]
        pageKey: string | undefined
      }

      nfts = nfts.concat(NFTPropertyMapper(res.ownedNfts))

      pageKey = res.pageKey
    } while (pageKey && ++runs <= maxRuns)
  }

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
  contracts: any[]
  addresses: string[]
  alchemyClient: AlchemyClient
}) => {
  // Max limit on Alchemy is 45 contract addresses per request.
  // We need batches with 45 contracts in each

  const batches = sliceIntoChunks(
    contracts.map((contract: any) => contract.address),
    45
  )
  // Promise.all only to avoid promise chains
  return Promise.all(
    batches.map(async (batch: any) => {
      const visitedMap: any = {}
      batch.forEach((contract: string) => {
        visitedMap[`${contract}`] = true
      })
      const res: any = []
      let localBatch = Object.keys(visitedMap)

      while (localBatch.length > 0) {
        try {
          // We have multiple batches and multiple addresses
          // Essentially we need to mapreduce through them all
          // - that's why we have nested cycles
          // then we need to combine nfts in one object - thats why we are using
          // refuce after
          const nfts: any = (
            await Promise.all(
              addresses.map(async (address) => {
                return await alchemyClient.getNFTs({
                  owner: address,
                  contractAddresses: localBatch,
                  pageSize: localBatch.length * 3,
                })
              })
            )
          ).reduce(
            (acc: any, contract: any) => {
              return {
                ownedNfts: acc.ownedNfts.concat(contract.ownedNfts),
                // they all have same blockHash
                blockHash: contract.blockHash,
                totalCount: contract.totalCount + acc.totalCount,
              }
            },
            { ownedNfts: [], blockHash: '', totalCount: 0 }
          )
          nfts.ownedNfts.forEach((nft: any) => {
            delete visitedMap[`${nft.contract.address}`]
          })
          localBatch = Object.keys(visitedMap)
          res.push(nfts.ownedNfts)
        } catch (ex) {
          console.error(new GraphQLYogaError(ex as string))
          break
        }
      }
      return res
    })
  )
}

export function sliceIntoChunks(arr: any, chunkSize: number) {
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
  nfts: any[]
  chain: string
  contracts: any[]
  network: string
}) => {
  let ownedNfts: any[] = []

  nfts.forEach((batch: any) => {
    ownedNfts.push(...batch)
  })

  const collectionsHashMap: any = {}
  ownedNfts = NFTPropertyMapper(ownedNfts.flat())

  // Creating hashmap with contract addresses as keys
  // And nft arrays as values
  ownedNfts.forEach((NFT: any) => {
    NFT.chain = { chain, network }
    if (
      collectionsHashMap[`${NFT.contract.address}`] &&
      collectionsHashMap[`${NFT.contract.address}`].length
    ) {
      collectionsHashMap[`${NFT.contract.address}`].push(NFT)
    } else {
      collectionsHashMap[`${NFT.contract.address}`] = [NFT]
    }
  })

  // Attach NFT array to a contract object
  // With hash map key it is easy to find a needed array to specific
  // collection
  const beautifiedContracts = contracts.map((contract: any) => {
    return {
      ...contract,
      ownedNfts: collectionsHashMap[`${contract.address}`],
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
  const [ethContracts, polyContracts]: [any[], any[]] = await Promise.all([
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

  const ethereumContracts = ethContracts.reduce(
    (acc, instance) => {
      return {
        contracts: acc.contracts.concat(instance.contracts),
        totalCount: acc.totalCount + instance.totalCount,
      }
    },
    { contracts: [], totalCount: 0 }
  )

  const polygonContracts = polyContracts.reduce(
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
