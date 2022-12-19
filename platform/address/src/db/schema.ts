import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm-sqlite'

export type TokensTable = {
  tokenId: string
  contract: string
  addressURN: string
  gallery_order?: number
}

export const tokens = sqliteTable(
  'tokens',
  {
    tokenId: text('tokenId').primaryKey(),
    contract: text('contract').notNull(),
    addressURN: text('addressURN').notNull(), // current holder
    gallery_order: integer('gallery_order'), // NOTE: when upserting address_token we should set order to null
  },
  (table) => ({
    addressIdx: index('IDX_tokens__addressURN').on(table.addressURN),
    contractIdx: index('IDX_tokens__contract').on(table.contract),
    uniquePK: uniqueIndex('IDX_token_addresses__addressURN__tokenId').on(
      table.tokenId,
      table.contract
    ),
  })
)

export const collections = sqliteTable(
  'collections',
  {
    contract: text('contract').primaryKey(),
    // .references(() => tokens.contract),
    name: text('name').notNull(),
  },
  (table) => ({})
)
