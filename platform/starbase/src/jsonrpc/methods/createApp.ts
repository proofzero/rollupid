import { z } from 'zod'
import { Context } from '../context'
import * as oauth from '../../OAuth'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { ApplicationURNSpace } from '@kubelt/urns/application'
import createEdgesClient from '@kubelt/platform-clients/edges'
import { EDGE_APPLICATION } from '../../types'

export const CreateAppInputSchema = z.object({
  clientName: z.string(),
})

export const CreateAppOutputSchema = z.object({
  clientId: z.string(),
})

export const createApp = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof CreateAppInputSchema>
  ctx: Context
}): Promise<z.infer<typeof CreateAppOutputSchema>> => {
  //TODO(betim) check if app with that name exists for account

  // Create initial OAuth configuration for the application. There
  // is no secret associated with the app after creation. The
  // rotateSecret method must be called to generate the initial
  // OAuth secret and return it to the caller.
  const clientId = oauth.makeClientId()
  const appURN = ApplicationURNSpace.componentizedUrn(clientId, undefined, {
    name: input.clientName,
  })
  if (!ctx.accountURN) throw new Error('No account URN in context')

  const appDO = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)
  await appDO.class.init(clientId, input.clientName)

  // We need to create an edge between the logged in user node (aka
  // account) and the new app.
  const edgesClient = createEdgesClient(ctx.Edges)
  const edgeRes = await edgesClient.makeEdge.mutate({
    src: ctx.accountURN,
    dst: appURN,
    tag: EDGE_APPLICATION,
  })

  if (!edgeRes.edge) {
    console.error({ edgeRes })
    throw new Error(
      `Could not link app ${clientId} to account ${ctx.accountURN}`
    )
  } else {
    console.log(`Created app ${clientId} for account ${ctx.accountURN}`)
  }

  return {
    clientId: clientId,
  }
}
