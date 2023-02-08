import { GraphQLYogaError } from '@graphql-yoga/common'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../../packages/alchemy-client'

import Env from '../../../env'

type AlchemyClients = {
  ethereumClient: AlchemyClient
  polygonClient: AlchemyClient
}

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

import type { Nft, NftContract, NftContracts } from '../typedefs'

export const sortNftsAlphabetically = (ownedNfts: Nft[]) => {
  return ownedNfts.sort((a, b) =>
    (a.contractMetadata?.name ?? '').localeCompare(
      b.contractMetadata?.name ?? ''
    )
  )
}

export const getNftsForAllChains = async (
  alchemyClients: AlchemyClients,
  addresses: string[],
  contractAddresses: string[],
  maxRuns: number = 3
) => {
  try {
    const [ethNfts, polyNfts] = await Promise.all([
      getAllNfts(alchemyClients.ethereumClient, addresses, contractAddresses),
      getAllNfts(alchemyClients.polygonClient, addresses, contractAddresses),
    ])

    return ethNfts.concat(polyNfts)
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
  }
  return []
}

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
  const chain = alchemyClient.getChain()

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

export const nftBatchesFetcherForAllChains = async ({
  contracts,
  addresses,
  alchemyClients,
}: {
  contracts: {
    ethereum: NftContract[]
    polygon: NftContract[]
  }
  addresses: string[]
  alchemyClients: AlchemyClients
}) => {
  try {
    // This way in each nested collection we have its own Promise.all
    // And one common Promise.all on top of them.

    const NFTs = await Promise.all([
      Promise.all(
        await nftBatchesFetcher({
          contracts: contracts.ethereum,
          addresses,
          alchemyClient: alchemyClients.ethereumClient,
        })
      ),
      Promise.all(
        await nftBatchesFetcher({
          contracts: contracts.polygon,
          addresses,
          alchemyClient: alchemyClients.polygonClient,
        })
      ),
    ])

    return { ethereumNfts: NFTs[0], polygonNfts: NFTs[1] }
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return { ethereumNfts: [], polygonNfts: [] }
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
          // reduce after
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

export const beautifyContractsForAllChains = (
  clients: {
    nfts: Nft[]
    chain: string
    contracts: NftContract[]
    network: string
  }[]
) => {
  const beautifiedContracts = clients.reduce<NftContract[]>((acc, client) => {
    return [...acc, ...beautifyContracts({ ...client })]
  }, [])
  return beautifiedContracts
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
  let ownedNfts: Nft[] = NFTPropertyMapper(nfts.flat())

  const collectionsHashMap = new Map()

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
  const beautifiedContracts: NftContract[] = contracts.map(
    (contract: NftContract) => {
      return {
        ...contract,
        ownedNfts: collectionsHashMap.get(contract.address),
        chain: { chain, network },
      }
    }
  )

  return beautifiedContracts
}

export const fetchContracts = async ({
  addresses,
  alchemyClients,
  excludeFilters,
}: {
  addresses: string[]
  alchemyClients: AlchemyClients
  excludeFilters: string[]
}) => {
  try {
    const [ethContracts, polyContracts]: [
      { contracts: NftContract[]; totalCount: number }[],
      { contracts: NftContract[]; totalCount: number }[]
    ] = await Promise.all([
      Promise.all(
        addresses.map(
          async (address) =>
            await alchemyClients.ethereumClient.getContractsForOwner({
              address,
              excludeFilters,
            })
        )
      ),
      Promise.all(
        addresses.map(
          async (address) =>
            await alchemyClients.polygonClient.getContractsForOwner({
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

    const polygonContracts: contracts = polyContracts.reduce(
      (acc, instance) => {
        return {
          contracts: acc.contracts.concat(instance.contracts),
          totalCount: acc.totalCount + instance.totalCount,
        }
      },
      { contracts: [], totalCount: 0 }
    )

    return {
      ethereum: ethereumContracts.contracts,
      polygon: polygonContracts.contracts,
    }
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return {
      ethereum: [],
      polygon: [],
    }
  }
}

export const getNftMetadataForAllChains = async (
  input: {
    contractAddress: string
    tokenId: string
    chain: string
  }[],
  alchemyClients: AlchemyClients,
  env: ResolverContext['env']
) => {
  const ethereumInput = input.filter((inp) => inp.chain === 'eth')
  const polygonInput = input.filter((inp) => inp.chain === 'polygon')
  try {
    const [ethereumNfts, polygonNfts]: [Nft[], Nft[]] = await Promise.all([
      alchemyClients.ethereumClient.getNFTMetadataBatch(ethereumInput),
      alchemyClients.polygonClient.getNFTMetadataBatch(polygonInput),
    ])

    return ethereumNfts
      .map((nft) => ({
        ...nft,
        chain: {
          chain: AlchemyChain.ethereum,
          network: env.ALCHEMY_ETH_NETWORK,
        },
      }))
      .concat(
        polygonNfts.map((nft) => ({
          ...nft,
          chain: {
            chain: AlchemyChain.polygon,
            network: env.ALCHEMY_POLYGON_NETWORK,
          },
        }))
      )
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return []
  }
}
