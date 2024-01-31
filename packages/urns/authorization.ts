import { createRollupIdURNSpace, RollupIdURN } from '.'

export type AuthorizationRComp = {
  client_id: string
}

export type AuthorizationURN = RollupIdURN<`authorization/${string}`>
export const AuthorizationURNSpace = createRollupIdURNSpace<
  'authorization',
  AuthorizationRComp
>('authorization')
