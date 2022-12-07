// @kubelt/graph:db/entity/Node.ts

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from "typeorm"

import { Edge } from './Edge'
import { URNQComponent } from './URNQComponent'
import { URNRComponent } from './URNRComponent'

// Definitions
// -----------------------------------------------------------------------------

// Maximum length of a platform URN.
const LENGTH_URN = 8192

// Node
// -----------------------------------------------------------------------------
// NB: we declare the columns with ! to avoid TS2564, an error that
// occurs when a property is detected not to have an initializer. We
// rely on the ORM to manage initialization of new instances for us.

@Entity()
export class Node {

  /**
   * The URN for a durable object instance.
   */
  @PrimaryColumn({
    length: LENGTH_URN,
  })
  urn!: string

  /**
   * The URN namespace ID.
   */
  @Column()
  nid!: string

  /**
   * The URN namespace specific string.
   */
  @Column()
  nss!: string

  /**
   * The URN fragment, if any. An empty string if no fragment component
   * was part of the node URN.
   */
  @Column()
  fragment!: string

  /**
   * Any URN q-components present in the node URN.
   */
  @ManyToMany(() => URNQComponent)
  @JoinTable()
  qcomp!: URNQComponent[]

  /**
   * Any URN r-components present in the node URN.
   */
  @ManyToMany(() => URNRComponent)
  @JoinTable()
  rcomp!: URNRComponent[]

  /**
   * The outgoing edges that originate at this node.
   */
  @OneToMany(() => Edge, (edge) => edge.src)
  outgoing!: Edge[]

  /**
   * The incoming edges that terminate at this node.
   */
  @OneToMany(() => Edge, (edge) => edge.dst)
  incoming!: Edge[]

  // TODO is there any other information about a node we want to store?

}
