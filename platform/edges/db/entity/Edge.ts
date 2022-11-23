// @kubelt/graph:db/entity/Edge.ts

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm"

import { Node } from './Node'
import { Permission } from './Permission'

// Definitions
// -----------------------------------------------------------------------------

// The maximum allowed length of an edge tag.
const LENGTH_EDGE_TAG = 512

// Edge
// -----------------------------------------------------------------------------
// NB: we declare the columns with ! to avoid TS2564, an error that
// occurs when a property is detected not to have an initializer. We
// rely on the ORM to manage initialization of new instances for us.

@Entity()
@Index(['src', 'dst', 'tag'], { unique: true })
export class Edge {

  @PrimaryGeneratedColumn()
  id!: number

  /**
   * The ID of the edge start node.
   */
  @ManyToOne(() => Node, (node) => node.outgoing)
  src!: Node

  /**
   * The ID of the edge end node.
   */
  @ManyToOne(() => Node, (node) => node.incoming)
  dst!: Node

  /**
   * A type tag for the edge.
   */
  @Column({
    length: LENGTH_EDGE_TAG,
  })
  tag!: string

  /**
   * A scope required to traverse the edge.
   *
   * TODO should this be a collection?
   */
  @ManyToMany(() => Permission, (permission) => permission.edges)
  @JoinTable()
  permissions!: Permission[]

}
