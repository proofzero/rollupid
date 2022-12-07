// @kubelt/graph:db/entity/Permission.ts

import {
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm"

import { Edge } from './Edge'

// Scope
// -----------------------------------------------------------------------------
// NB: we declare the columns with ! to avoid TS2564, an error that
// occurs when a property is detected not to have an initializer. We
// rely on the ORM to manage initialization of new instances for us.

@Entity()
export class Permission {

  @PrimaryGeneratedColumn()
  id!: number

  @ManyToMany(() => Edge, (edge) => edge.permissions)
  edges!: Edge[]

  /**
   * The name of the permission. Must be a platform scope.
   */
  @Column()
  name!: string

}
