import { AnyURN } from '@kubelt/urns'
import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from 'drizzle-orm-sqlite'

export type PermissionTable = {
  id: number
  edges: EdgeTable[]
  name: string
}

export type URNRComponentTable = {
  id: number
  key: string
  value: string
}

export type URNQComponentTable = {
  id: number
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
  permission: PermissionTable[]
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
    id: integer('id').primaryKey({
      autoIncrement: true,
    }),
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
  },
  (table) => ({
    edge: uniqueIndex('IDX_edge_src_dst_tag').on(
      table.src,
      table.dst,
      table.tag
    ),
  })
)

export const permission = sqliteTable('permission', {
  id: integer('id').primaryKey({
    autoIncrement: true,
  }),
  name: text('name').notNull(),
})

export const nodeQcomp = sqliteTable(
  'node_qcomp',
  {
    nodeUrn: text('nodeUrn')
      .notNull()
      .references(() => node.urn, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    qCompKey: text('qCompKey').notNull(),
    qCompValue: text('qCompValue').notNull(),
  },
  (table) => ({
    node_qcomp: uniqueIndex('IDX_node_qcomp_pk').on(
      table.nodeUrn,
      table.qCompKey
    ),
    nodeUrn: index('IDX_node_qcomp_nodeUrn').on(table.nodeUrn),
    qCompKey: index('IDX_node_qcomp_key').on(table.qCompKey),
    qCompValue: index('IDX_node_qcomp_value').on(table.qCompValue),
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
    rCompKey: text('rCompKey').notNull(),
    rCompValue: text('rCompValue').notNull(),
  },
  (table) => ({
    node_rcomp: uniqueIndex('IDX_node_rcomp_pk').on(
      table.nodeUrn,
      table.rCompKey
    ),
    nodeUrn: index('IDX_node_rcomp_nodeUrn').on(table.nodeUrn),
    rCompKey: index('IDX_node_rcomp_key').on(table.rCompKey),
    rCompValue: index('IDX_node_rcomp_value').on(table.rCompValue),
  })
)

export const edgePermission = sqliteTable(
  'edge_permission',
  {
    edgeId: integer('edgeId')
      .notNull()
      .references(() => edge.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    permissionId: integer('permissionId')
      .notNull()
      .references(() => permission.id, {
        onDelete: 'no action',
        onUpdate: 'no action',
      }),
  },
  (table) => ({
    edge_permission: uniqueIndex('IDX_edge_permission_pk').on(
      table.edgeId,
      table.permissionId
    ),
    nodeUrn: index('IDX_edge_permission_edgeId').on(table.edgeId),
    permission: index('IDX_edge_permission_permission').on(table.permissionId),
  })
)
