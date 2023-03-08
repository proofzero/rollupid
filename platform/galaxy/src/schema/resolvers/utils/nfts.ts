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

import { Gallery, GalleryItem } from '@kubelt/platform.account/src/types'

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

// -------------------- GALLERY VERIFICATION -----------------------------------
export const validOwnership = async (
  gallery: Gallery,
  env: ResolverContext['env'],
  connectedAddresses: string[]
) => {
  const { ethereumClient, polygonClient } = getAlchemyClients({ env })

  const [ethContractAddressesSet, polyContractAddressesSet] = gallery.reduce(
    ([ethereum, polygon], nft) => {
      // type error will go away after cleaning gallery schema
      nft.chain.chain === 'eth'
        ? ethereum.add(nft.contract.address)
        : polygon.add(nft.contract.address)
      return [ethereum, polygon]
    },
    [new Set([] as string[]), new Set([] as string[])]
  )

  const ethContractAddresses = Array.from(ethContractAddressesSet)
  const polyContractAddresses = Array.from(polyContractAddressesSet)

  /** Struct of this map is like this:
   {
    contractAddress1: [all tokens that user own in this contract],
    contractAddress2: [all tokens that user own in this contract],
    ...
    contractAddressN: [all tokens that user own in this contract],
    } 
  */
  const validator = new Map<string, string[]>()

  const nfts: GetNFTsResult[] = (
    await Promise.all(
      connectedAddresses.map((address) =>
        Promise.all([
          ethContractAddresses.length
            ? ethereumClient.getNFTs({
                owner: address,
                contractAddresses: ethContractAddresses,
              })
            : ({ ownedNfts: [] } as GetNFTsResult),
          polyContractAddresses.length
            ? polygonClient.getNFTs({
                owner: address,
                contractAddresses: polyContractAddresses,
              })
            : ({ ownedNfts: [] } as GetNFTsResult),
        ])
      )
    )
  ).flat()

  // .flat because previous Promise.all returns an array of arrays,
  // we just need internal arrays of nfts. These internal arrays are arrays
  // of objects with ownedNfts property
  // These methods populate validator map to then check if the user owns nfts.
  nfts.forEach((deeperNfts) => {
    deeperNfts.ownedNfts?.forEach((nft) => {
      const val = validator.get(nft.contract?.address as string)
      validator.set(
        nft.contract?.address as string,
        (val ? val : []).concat([nft.id?.tokenId as string])
      )
    })
  })

  return gallery.filter((nft) => {
    // type error will go away after cleaning gallery schema
    return validator.get(nft.contract.address)?.includes(nft.tokenId)
  })
}

// -------- TEMPORARY MIGRATION PART -------------------------------------------
const gatewayFromIpfs = (
  ipfsUrl: string | undefined | null
): string | undefined | null => {
  const regex =
    /ipfs:\/\/(?<prefix>ipfs\/)?(?<cid>[a-zA-Z0-9]+)(?<path>(?:\/[\w.-]+)+)?/
  const match = ipfsUrl?.match(regex)

  if (!ipfsUrl || !match) return ipfsUrl

  const prefix = match[1]
  const cid = match[2]
  const path = match[3]

  return `https://nftstorage.link/${prefix ? `${prefix}` : 'ipfs/'}${cid}${
    path ? `${path}` : ''
  }`
}

const capitalizeFirstLetter = (string?: string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : null
}

export const sortNftsFn = (a: any, b: any) => {
  if (b.collectionTitle === null) {
    return -1
  } else {
    return a.collectionTitle?.localeCompare(b.collectionTitle) || 1
  }
}

const decorateNft = (nft: Nft): GalleryItem => {
  const media = Array.isArray(nft.media) ? nft.media[0] : nft.media
  let error = false
  if (nft.error) {
    error = true
  }

  const details = [
    {
      name: 'NFT Contract',
      value: nft.contract?.address,
      isCopyable: true,
    },
    {
      name: 'NFT Standard',
      value: nft.contractMetadata?.tokenType?.toString(),
      isCopyable: false,
    },
    {
      name: 'Chain',
      value: capitalizeFirstLetter(nft.chain?.chain),
      isCopyable: false,
    },
    {
      name: 'Network',
      value: capitalizeFirstLetter(nft.chain?.network),
      isCopyable: false,
    },
  ]
  if (nft.id && nft.id.tokenId) {
    details.push({
      name: 'Token ID',
      value: BigInt(nft.id.tokenId).toString(10),
      isCopyable: true,
    })
  }

  return {
    url: gatewayFromIpfs(media?.raw),
    thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
    error: error,
    title: nft.title,
    contract: nft.contract,
    tokenId: nft.id.tokenId,
    chain: nft.chain!,
    collectionTitle: nft.contractMetadata?.name,
    properties: nft.metadata?.properties,
    details: details,
  }
}

/**
 * Sort and filter errors out
 */
export const decorateNfts = (ownedNfts: Nft[]) => {
  const decoratedNfts = ownedNfts.map((nft: Nft) => {
    return decorateNft(nft)
  })

  const filteredNfts =
    decoratedNfts?.filter((n: any) => !n.error && n.thumbnailUrl) || []

  const sortedNfts = filteredNfts.sort(sortNftsFn)
  return sortedNfts
}
