// @kubelt/graph:db/entity/Edge.ts

import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

// Definitions
// -----------------------------------------------------------------------------

const KEY_LENGTH = 64

const VALUE_LENGTH = 512

// Edge
// -----------------------------------------------------------------------------
// NB: we declare the columns with ! to avoid TS2564, an error that
// occurs when a property is detected not to have an initializer. We
// rely on the ORM to manage initialization of new instances for us.

@Entity()
@Index(['key', 'value'], { unique: true })
export class URNRComponent {
  @PrimaryGeneratedColumn()
  id!: number

  /**
   * The Key of the r component.
   */
  @Column({
    length: KEY_LENGTH,
  })
  key!: string

  /**
   * The Value of the r component.
   */
  @Column({
    length: VALUE_LENGTH,
  })
  value!: string
}
