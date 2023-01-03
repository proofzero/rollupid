import { Context } from '../../context'

export const pongMethod = async ({
  input,
  ctx,
}: {
  input: unknown
  ctx: Context
}) => {
  throw 'cannot pong'
}
