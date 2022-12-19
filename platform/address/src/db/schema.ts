import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm-sqlite'

export const tokens = sqliteTable(
  'tokens',
  {
    tokenId: text('tokenId').primaryKey(),
    contract: text('contract').notNull(),
  },
  (table) => ({
    IDX_tokens__contract: index('IDX_tokens__contract').on(table.contract),
  })
)

export const address_tokens = sqliteTable(
  'address_tokens',
  {
    addressURN: text('addressURN').notNull(),
    tokenId: text('tokenId').notNull(),
    // .references(() => tokens.tokenId),
    gallery_order: integer('gallery_order'), // NOTE: when upserting address_token we should set order to null
  },
  (table) => ({
    uniquePK: uniqueIndex('IDX_address_tokens__addressURN__tokenId').on(
      table.addressURN,
      table.tokenId
    ),
    addressIdx: index('IDX_address_tokens__addressURN').on(table.addressURN),
    tokenIdx: index('IDX_address_tokens__tokenId').on(table.tokenId),
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
