import { z } from 'zod'
import { Context } from "../context";
import { getApplicationNodeByClientId } from '../../nodes/application/application';
import { ApplicationURNSpace } from '@kubelt/urns/application';
import createEdgesClient from '@kubelt/platform-clients/edges'
import { EDGE_APPLICATION } from '@kubelt/graph/edges';
import { AppClientIdParamSchema } from '../../types';

export const deleteApp = async({
  input, 
  ctx
}:{
  input: z.infer<typeof AppClientIdParamSchema>,
  ctx: Context
}) : Promise<void> => {
  
  const appURN = ApplicationURNSpace.urn(input.clientId)
  
  const appDO = await getApplicationNodeByClientId(input.clientId, ctx.Starbase)
  
  const edgesClient = createEdgesClient(ctx.Edges)
  await edgesClient.removeEdge.mutate({
    src: ctx.accountURN,
    dst: appURN,
    tag: EDGE_APPLICATION,
  })
  await appDO.class.delete()
  
  console.log(`Deleted app ${input.clientId} from account ${ctx.accountURN}`)
}