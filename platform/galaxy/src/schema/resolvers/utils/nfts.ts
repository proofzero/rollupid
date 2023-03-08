import { GraphQLYogaError } from '@graphql-yoga/common'

import {
  AlchemyChain,
  AlchemyClient,
  AlchemyClientConfig,
  NFTPropertyMapper,
} from '../../../../../../packages/alchemy-client'

import Env from '../../../env'

// -------------------- TYPES --------------------------------------------------

import type { Nft, NftContract } from '../typedefs'
import type { GetNFTsResult } from '../../../../../../packages/alchemy-client'

type AlchemyClients = {
  ethereumClient: AlchemyClient
  polygonClient: AlchemyClient
}

type decoratedNft = {
  url?: string
  thumbnailUrl?: string
  error: boolean
  title?: Nft['title']
  contract: Nft['contract']
  tokenId?: string | null
  chain: Nft['chain']
  collectionTitle?: string | null
  properties?: any[] | null
  details: { name: string; value?: string | null; isCopyable: boolean }[]
}

type ResolverContext = {
  env: Env
  jwt?: string
  coreId?: string
}

// -------------------- HELPERS ------------------------------------------------

export const sortNftsAlphabetically = (ownedNfts: Nft[]) => {
  return ownedNfts.sort((a, b) =>
    (a.contractMetadata?.name ?? '').localeCompare(
      b.contractMetadata?.name ?? ''
    )
  )
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
        id: { tokenId: ct.tokenId! },
        tokenUri: { raw: ct.media?.[0].raw, gateway: ct.media?.[0].gateway },
        media: ct.media,
        contractMetadata: {
          name: ct.name,
          symbol: ct.symbol,
          openSea: ct.opensea!,
        },
        chain: ct.chain,
        balance: ct.totalBalance?.toString(),
        contract: { address: ct.address! },
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
    let [ethereumNfts, polygonNfts] = await Promise.all([
      chainedInput.has(AlchemyChain.ethereum)
        ? (alchemyClients.ethereumClient.getNFTMetadataBatch(
            chainedInput.get(AlchemyChain.ethereum)!
          ) as Promise<Nft[]>)
        : [],
      chainedInput.has(AlchemyChain.polygon)
        ? (alchemyClients.polygonClient.getNFTMetadataBatch(
            chainedInput.get(AlchemyChain.polygon)!
          ) as Promise<Nft[]>)
        : [],
    ])

    // Gallery stores as an array in account DO, so not need to keep order separately
    // But here it fetches metadata asynchronous - so order may be lost

    ethereumNfts = NFTPropertyMapper(ethereumNfts)
    polygonNfts = NFTPropertyMapper(polygonNfts)

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
