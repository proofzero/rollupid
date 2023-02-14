import { GraphQLYogaError } from '@graphql-yoga/common'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../../packages/alchemy-client'

import Env from '../../../env'

// -------------------- TYPES --------------------------------------------------

import type { Gallery, Nft, NftContract, NftContracts, NfTs } from '../typedefs'

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
// -------------------- END OF TYPES -------------------------------------------

// -------------------- HELPERS ------------------------------------------------

export const sortNftsAlphabetically = (ownedNfts: Nft[]) => {
  return ownedNfts.sort((a, b) =>
    (a.contractMetadata?.name ?? '').localeCompare(
      b.contractMetadata?.name ?? ''
    )
  )
}

export function sliceIntoChunks(arr: any[], chunkSize: number) {
  const res = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    res.push(chunk)
  }
  return res
}

export const normalizeContractsForAllChains = (
  clients: {
    nfts: Nft[]
    chain: string
    contracts: NftContract[]
    network: string
  }[]
) => {
  const beautifiedContracts = clients.reduce<NftContract[]>((acc, client) => {
    return [...acc, ...normalizeContracts({ ...client })]
  }, [])
  return beautifiedContracts
}

export const normalizeContracts = ({
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

// -------------------- END OF HELPERS -----------------------------------------

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

// -------------------- ALL NFTS FOR SPECIFIED CONTRACTS -----------------------

export const getNftsForAllChains = async (
  alchemyClients: AlchemyClients,
  addresses: string[],
  contractAddresses: string[],
  maxRuns: number = 3
) => {
  try {
    const [ethNfts, polyNfts] = await Promise.all([
      getNfts(
        alchemyClients.ethereumClient,
        addresses,
        contractAddresses,
        maxRuns
      ),
      getNfts(
        alchemyClients.polygonClient,
        addresses,
        contractAddresses,
        maxRuns
      ),
    ])

    return ethNfts.concat(polyNfts)
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return []
  }
}

export const getNfts = async (
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

// -------------------- ALL CONTRACTS + 1 NFT ----------------------------------

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
        await getNftBatches({
          contracts: contracts.ethereum,
          addresses,
          alchemyClient: alchemyClients.ethereumClient,
        })
      ),
      Promise.all(
        await getNftBatches({
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

export const getNftBatches = async ({
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
  // TODO: change to async npm package
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
    const instances = await Promise.all(
      addresses.map(async (address) => {
        return await Promise.all([
          alchemyClients.ethereumClient.getContractsForOwner({
            address,
            excludeFilters,
          }) as Promise<NftContracts>,
          alchemyClients.polygonClient.getContractsForOwner({
            address,
            excludeFilters,
          }) as Promise<NftContracts>,
        ])
      })
    )

    const [ethereumContracts, polygonContracts] = instances.reduce<
      [NftContracts, NftContracts]
    >(
      (acc, instance) => {
        return [
          { contracts: acc[0].contracts.concat(instance[0].contracts) },
          { contracts: acc[1].contracts.concat(instance[1].contracts) },
        ]
      },
      [{ contracts: [] }, { contracts: [] }]
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

// -------------------- GALLERY ------------------------------------------------

export const getNftMetadataForAllChains = async (
  input: {
    contractAddress: string
    tokenId: string
    chain: string
  }[],
  alchemyClients: AlchemyClients,
  env: ResolverContext['env']
) => {
  const chainedInput = new Map<string, typeof input>()
  const orders = new Map<string, number>()
  input.forEach((instance, index) => {
    orders.set(`${instance.contractAddress}${instance.tokenId}`, index)
    chainedInput.set(
      instance.chain,
      (chainedInput.get(instance.chain) || []).concat([instance])
    )
  })

  try {
    const [ethereumNfts, polygonNfts] = await Promise.all([
      alchemyClients.ethereumClient.getNFTMetadataBatch(
        chainedInput.get(AlchemyChain.ethereum)!
      ) as Promise<Nft[]>,
      alchemyClients.polygonClient.getNFTMetadataBatch(
        chainedInput.get(AlchemyChain.polygon)!
      ) as Promise<Nft[]>,
    ])

    // Gallery stores as an array in account DO, so not need to keep order separately
    // But here it fetches metadata asynchronous - so order may be lost

    const nfts = ethereumNfts
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

    return nfts.reduce<Nft[]>((acc, nft) => {
      acc[orders.get(`${nft.contract?.address}${nft.id?.tokenId}`) as number] =
        nft
      return acc
    }, Array(nfts.length))
  } catch (ex) {
    console.error(new GraphQLYogaError(ex as string))
    return []
  }
}

// -------------------- GALLERY VERIFICATION -----------------------------------

export const validOwnership = async (
  gallery: Gallery[],
  env: ResolverContext['env'],
  connectedAddresses: string[]
) => {
  const { ethereumClient, polygonClient } = getAlchemyClients({ env })

  const [ethContractAddresses, polyContractAddresses] = gallery.reduce(
    ([ethereum, polygon], nft) => {
      return nft.chain === 'eth'
        ? [[...ethereum, nft.contract], polygon]
        : [ethereum, [...polygon, nft.contract]]
    },
    [[] as string[], [] as string[]]
  )

  /** Struct of this map is like this:
   {
    contractAddress1: [all tokens that user own in this contract],
    contractAddress2: [all tokens that user own in this contract],
    ...
    contractAddressN: [all tokens that user own in this contract],
    } 
  */
  const validator = new Map<string, string[]>()

  const nfts: [NfTs, NfTs] = await Promise.all(
    connectedAddresses.map((address) =>
      Promise.all([
        ethereumClient.getNFTs({
          owner: address,
          contractAddresses: ethContractAddresses,
        }),
        polygonClient.getNFTs({
          owner: address,
          contractAddresses: polyContractAddresses,
        }),
      ])
    )
  )

  // .flat because previous Promise.all returns an array of arrays,
  // we just need internal arrays of nfts. These internal arrays are arrays
  // of objects with ownedNfts property
  // These methods populate validator map to then check if the user owns nfts.
  nfts.flat().forEach((deeperNfts) => {
    deeperNfts.ownedNfts.forEach((nft) => {
      const val = validator.get(nft.contract?.address as string)
      validator.set(
        nft.contract?.address as string,
        (val ? val : []).concat([nft.id?.tokenId as string])
      )
    })
  })

  return validator
}
