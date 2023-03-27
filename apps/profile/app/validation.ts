import { z } from 'zod'

import type {
  AlchemyChain,
  AlchemyNetwork,
} from '@proofzero/packages/alchemy-client'

export const RollupAuthSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  extraParams: z.object({
    scopes: z.string().optional(),
    redirect_uri: z.string().optional(),
  }),
})

// -------------------------- NFTs ---------------------------------------------

export const ChainSchema = z.object({
  chain: z.custom<AlchemyChain>((chain) => {
    if (typeof chain !== 'string') {
      throw new Error(`Chain is not a string: ${chain}`)
    }
    if (chain !== 'eth' && chain !== 'polygon') {
      throw new Error(
        `Supported chains are only eth and polygon, got: ${chain}`
      )
    }
    return chain as AlchemyChain
  }),
  network: z.custom<AlchemyNetwork>((network) => {
    if (typeof network !== 'string') {
      throw new Error(`Chain is not a string: ${network}`)
    }
    if (network !== 'mainnet' && network !== 'goerli' && network !== 'mumbai') {
      throw new Error(
        `Supported networks are only mumbai, goerli and mainnet, got: ${network}`
      )
    }
    return network as AlchemyNetwork
  }),
})

export const ContractSchema = z.object({
  address: z.string(),
})

export const NFTDetailSchema = z.object({
  isCopyable: z.boolean(),
  name: z.string(),
  value: z.string(),
})

export const NFTPropertySchema = z.object({
  display: z.string(),
  name: z.string(),
  value: z.string(),
})

export const NFTSchema = z.object({
  url: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  contract: ContractSchema,
  tokenId: z.string(),
  chain: ChainSchema,
  collectionTitle: z.string().optional().nullable(),
  properties: z.array(NFTPropertySchema).optional().nullable(),
  details: z.array(NFTDetailSchema),
})

// -------------------------- Profile ------------------------------------------

export const GallerySchema = z.array(NFTSchema)

//optional because could be changed to empty
export const LinkSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
  provider: z.string().optional(),
  verified: z.boolean().default(false),
})

//optional because could be changed to empty
export const LinksSchema = z.array(LinkSchema)

export const FullProfileSchema = z.object({
  displayName: z.string(),
  pfp: z.object({
    image: z.string(),
    isToken: z.boolean().optional(),
  }),
  links: LinksSchema.optional(),
  gallery: GallerySchema.optional(),
  handle: z.string().optional(),
  version: z.number().optional(),
  bio: z.string(),
  job: z.string(),
  location: z.string(),
})
