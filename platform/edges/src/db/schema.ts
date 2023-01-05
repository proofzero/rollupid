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

export const URNQComponent = sqliteTable(
  'urnq_component',
  {
    id: integer('id').primaryKey({
      autoIncrement: true,
    }),
    key: text('key').notNull(),
    value: text('value').notNull(),
  },
  (table) => ({
    urnq_component: uniqueIndex('IDX_urnq_component_key_value').on(
      table.key,
      table.value
    ),
  })
)

export const nodeQcompUrnqComponent = sqliteTable(
  'node_qcomp_urnq_component',
  {
    nodeUrn: text('nodeUrn')
      .notNull()
      .references(() => node.urn, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    qcomp: integer('qcomp')
      .notNull()
      .references(() => URNQComponent.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    node_rcomp: uniqueIndex('IDX_node_qcomp_urnq_component_pk').on(
      table.nodeUrn,
      table.qcomp
    ),
    nodeUrn: index('IDX_node_qcomp_urnq_component_nodeUrn').on(table.nodeUrn),
    qcomp: index('IDX_node_qcomp_urnq_component_nodeUrn').on(table.qcomp),
  })
)

export const URNRComponent = sqliteTable(
  'urnr_component',
  {
    id: integer('id').primaryKey({
      autoIncrement: true,
    }),
    key: text('key').notNull(),
    value: text('value').notNull(),
  },
  (table) => ({
    urnr_component: uniqueIndex('IDX_urnr_component_key_value').on(
      table.key,
      table.value
    ),
  })
)

export const nodeRcompUrnrComponent = sqliteTable(
  'node_rcomp_urnr_component',
  {
    nodeUrn: text('nodeUrn')
      .notNull()
      .references(() => node.urn, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    rcomp: integer('rcomp')
      .notNull()
      .references(() => URNRComponent.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => ({
    node_rcomp: uniqueIndex('IDX_node_rcomp_urnr_component_pk').on(
      table.nodeUrn,
      table.rcomp
    ),
    nodeUrn: index('IDX_node_rcomp_urnr_component_nodeUrn').on(table.nodeUrn),
    qcomp: index('IDX_node_rcomp_urnr_component_nodeUrn').on(table.rcomp),
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
    permission: integer('edgeId')
      .notNull()
      .references(() => permission.id, {
        onDelete: 'no action',
        onUpdate: 'no action',
      }),
  },
  (table) => ({
    edge_permission: uniqueIndex('IDX_edge_permission_pk').on(
      table.edgeId,
      table.permission
    ),
    nodeUrn: index('IDX_edge_permission_edgeId').on(table.edgeId),
    permission: index('IDX_edge_permission_permission').on(table.permission),
  })
)
