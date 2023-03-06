import { GraphQLYogaError } from '@graphql-yoga/common'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../../packages/alchemy-client'

import Env from '../../../env'
import { TokenType } from '../typedefs'

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
  chain,
  contracts,
  network,
}: {
  chain: string
  contracts: NftContract[]
  network: string
}) => {
  const beautifiedContracts = contracts.map((ct) => {
    ct.chain = {
      chain,
      network,
    }
    ct.ownedNfts = [
      {
        title: ct.title,
        id: { tokenId: ct.tokenId },
        tokenUri: { raw: ct.media?.raw, gateway: ct.media?.gateway },
        media: ct.media,
        contractMetadata: {
          name: ct.name,
          symbol: ct.symbol,
          openSea: ct.opensea!,
        },
        chain: ct.chain,
        balance: ct.totalBalance?.toString(),
        contract: { address: ct.address },
      },
    ]
    return ct
  })

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

// -------------------- ALL CONTRACTS ------------------------------------------

export const getContracts = async (
  alchemyClient: AlchemyClient,
  addresses: string[],
  excludeFilters: string[],
  maxRuns: number = 3
) => {
  let contracts: NftContract[] = []

  await Promise.all(
    addresses.map(async (address) => {
      let runs = 0
      let pageKey
      do {
        const res = (await alchemyClient.getContractsForOwner({
          address,
          pageKey,
          excludeFilters,
        })) as {
          contracts: NftContract[]
          pageKey: string | undefined
        }

        contracts = contracts.concat(res.contracts)

        pageKey = res.pageKey
      } while (pageKey && ++runs <= maxRuns)
    })
  )

  return contracts
}

export const getContractsForAllChains = async ({
  addresses,
  alchemyClients,
  excludeFilters,
}: {
  addresses: string[]
  alchemyClients: AlchemyClients
  excludeFilters: string[]
}) => {
  try {
    const [ethereumContracts, polygonContracts] = await Promise.all([
      getContracts(alchemyClients.ethereumClient, addresses, excludeFilters),
      getContracts(alchemyClients.polygonClient, addresses, excludeFilters),
    ])

    return {
      ethereum: ethereumContracts,
      polygon: polygonContracts,
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
      return nft.chain.chain === 'eth'
        ? [[...ethereum, nft.contract.address], polygon]
        : [ethereum, [...polygon, nft.contract.address]]
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

  return gallery.filter((nft) => {
    return validator.get(nft.contract.address)?.includes(nft.tokenId)
  })
}
