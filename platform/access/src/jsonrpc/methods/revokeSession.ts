// @kubelt/platform.access:src/jsonrpc/methods/revokeSession.ts

import { z } from 'zod'
import { AccessURNInput } from '@kubelt/platform-middleware/inputValidators'
import { EDGE_AUTHENTICATES } from '@kubelt/platform.access/src/constants'
import { Context } from '../../context'

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
  const access = input

  // Create the session object state; we don't control when it's garbage
  // collected. The InjectAccessNode middleware injects the accessNode
  // DO stub.
  await ctx.accessNode!.class.revoke()

  // Delete the edge linking an account node to an access (session)
  // node. NB: we use the InjectEdges middleware to supply this client.
  await ctx.edgesClient!.removeEdge.mutate({
    // We use the RequireAccount middleware to ensure that the account
    // value is present on the context, so it should not be possible for
    // it to be udnefined here in spite of the optional type marker on
    // the context definition.
    src: account!,
    dst: access,
    //TODO: This may need to be changed to EDGE_AUTHORIZES when we implement revoke
    tag: EDGE_AUTHENTICATES,
  })

  return true
}
