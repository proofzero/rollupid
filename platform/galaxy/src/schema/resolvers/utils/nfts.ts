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

export const nftBatchesFetcher = ({
  batches,
  owner,
  alchemyClient,
}: {
  batches: any[]
  owner: string
  alchemyClient: AlchemyClient
}) => {
  return batches.map(async (batch: any) => {
    const visitedMap: any = {}
    batch.forEach((contract: string) => {
      visitedMap[`${contract}`] = true
    })
    const res: any = []
    let localBatch = Object.keys(visitedMap)
    while (localBatch.length > 0) {
      try {
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
      } catch (ex) {
        console.error(new GraphQLYogaError(ex as string))
      }
    }
    return res
  })
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
