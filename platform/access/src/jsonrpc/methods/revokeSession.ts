// @kubelt/platform.access:src/jsonrpc/methods/revokeSession.ts

import { z } from 'zod'

import { AccessURNSpace } from '@kubelt/urns/access'

import createEdgesClient from '@kubelt/platform-clients/edges'
import { EDGE_ACCESS } from '@kubelt/platform.access/src/constants'

import { Context } from '../../context'
import { initAccessNodeByName } from '../../nodes'
import { AccessURNInput } from '@kubelt/platform-middleware/inputValidators'

export const RevokeSessionMethodInput = AccessURNInput

export const RevokeSessionMethodOutput = z.boolean()

export type RevokeSessionParams = z.infer<typeof RevokeSessionMethodInput>

export const revokeSessionMethod = async ({
  input,
  ctx,
}: {
  input: RevokeSessionParams
  ctx: Context
}) => {
  // The ValidateJWT middleware extracts the account URN from the JWT
  // and places it on the context.
  const account = ctx?.accountURN
  if (account === undefined) {
    throw new Error(`missing account`)
  }
  const access = input

  const name = AccessURNSpace.decode(input)
  const accessNode = await initAccessNodeByName(name, ctx.Access)

  // Create the session object state; we don't control when it's garbage
  // collected.
  await accessNode.class.revoke()

  // Delete the edge linking an account node to an access (session)
  // node.
  const edgesClient = createEdgesClient(ctx.Edges)
  await edgesClient.removeEdge.mutate({
    src: account,
    dst: access,
    tag: EDGE_ACCESS,
  })

  return true
}
