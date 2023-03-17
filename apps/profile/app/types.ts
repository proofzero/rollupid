import type { z } from 'zod'

import type {
  RollupAuthSchema,
  ChainSchema,
  ContractSchema,
  NFTDetailSchema,
  NFTPropertySchema,
  NFTSchema,
  GallerySchema,
  LinkSchema,
  LinksSchema,
  FullProfileSchema,
} from './validation'

export type RollupAuth = z.infer<typeof RollupAuthSchema>

// -------------------------- NFTs ---------------------------------------------

export type Chain = z.infer<typeof ChainSchema>

export type Contract = z.infer<typeof ContractSchema>

export type NFTDetail = z.infer<typeof NFTDetailSchema>

export type NFTProperty = z.infer<typeof NFTPropertySchema>

export type NFT = z.infer<typeof NFTSchema>

// -------------------------- Profile ------------------------------------------
export type Gallery = z.infer<typeof GallerySchema>

export type Link = z.infer<typeof LinkSchema>

export type Links = z.infer<typeof LinksSchema>

export type FullProfile = z.infer<typeof FullProfileSchema>
