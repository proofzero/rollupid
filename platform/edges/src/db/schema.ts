import { AnyURN } from '@kubelt/urns'
import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm-sqlite'

export type URNRComponentTable = {
  nodeUrn: number
  key: string
  value: string
}

export type URNQComponentTable = {
  nodeUrn: number
  key: string
  value: string
}

export type NodeTable = {
  urn: AnyURN
  nid: string
  nss: string
  fragment: string
  rcomp: URNRComponentTable[]
  qcomp: URNQComponentTable[]
  incoming: EdgeTable[]
}

export type EdgeTable = {
  id: number
  src: NodeTable
  dst: NodeTable
  tag: string
  createdTimestamp: string | null
}

export const node = sqliteTable('node', {
  urn: text('urn').primaryKey(),
  nid: text('nid').notNull(),
  nss: text('nss').notNull(),
  fragment: text('fragment').notNull(),
})

export const edge = sqliteTable(
  'edge',
  {
    tag: text('tag').notNull(),
    src: text('src')
      .notNull()
      .references(() => node.urn, {
        onDelete: 'no action',
        onUpdate: 'no action',
      }),
    dst: text('dst')
      .notNull()
      .references(() => node.urn, {
        onDelete: 'no action',
        onUpdate: 'no action',
      }),
    createdTimestamp: text('createdTimestamp'),
  },
  (table) => ({
    edge: primaryKey(table.src, table.dst, table.tag),
    tagidx: index('IDX_edge_tag').on(table.tag),
    srcidx: index('IDX_edge_src').on(table.src),
    dstidx: index('IDX_edge_dst').on(table.dst),
  })
)

export const nodeQcomp = sqliteTable(
  'node_qcomp',
  {
    nodeUrn: text('nodeUrn')
      .notNull()
      .references(() => node.urn, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    key: text('key').notNull(),
    value: text('value').notNull(),
  },
  (table) => ({
    node_qcomp: primaryKey(table.nodeUrn, table.key),
    nodeUrn: index('IDX_node_qcomp_nodeUrn').on(table.nodeUrn),
    qCompKey: index('IDX_node_qcomp_key').on(table.key),
    qCompValue: index('IDX_node_qcomp_value').on(table.value),
  })
)

export const nodeRcomp = sqliteTable(
  'node_rcomp',
  {
    nodeUrn: text('nodeUrn')
      .notNull()
      .references(() => node.urn, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    key: text('key').notNull(),
    value: text('value').notNull(),
  },
  (table) => ({
    node_rcomp: primaryKey(table.nodeUrn, table.key),
    nodeUrn: index('IDX_node_rcomp_nodeUrn').on(table.nodeUrn),
    rCompKey: index('IDX_node_rcomp_key').on(table.key),
    rCompValue: index('IDX_node_rcomp_value').on(table.value),
  })
)
