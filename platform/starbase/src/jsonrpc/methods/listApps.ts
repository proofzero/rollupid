import { z } from 'zod'
import { Context } from "../context";
import { getApplicationNodeByClientId } from '../../nodes/application/application';
import { ApplicationURN, ApplicationURNSpace } from '@kubelt/urns/application';
import createEdgesClient from '@kubelt/platform-clients/edges'
import { EDGE_APPLICATION } from '@kubelt/graph/edges';
import {  EdgeDirection } from '@kubelt/graph';
import { AppClientIdParamSchema, AppObject, AppObjectSchema } from '../../types';

export const ListAppsOutputSchema = z.array(
  AppObjectSchema
)

export const listApps = async({
  input, 
  ctx
}:{
  input: z.infer<typeof AppClientIdParamSchema>,
  ctx: Context
}) : Promise<z.infer<typeof ListAppsOutputSchema>> => {
  
  //Get application edges for the given accountURN
  const edgesClient = createEdgesClient(ctx.Edges)
  const edgeList = await edgesClient.getEdges.query({
    query: {
      id: ctx.accountURN,
      dir: EdgeDirection.Outgoing,
      tag: EDGE_APPLICATION,
    },
  })
  
  //Iterate through edges, pull out the clientId, and get app objects for each
  //app edge
  const result: AppObject[] = []
  for (const edge of edgeList && edgeList.edges) {
    const appURN = edge.dst.id as ApplicationURN
    const clientId = ApplicationURNSpace.decode(appURN)
    const appDO = await getApplicationNodeByClientId(clientId, ctx.Starbase)
    const appDetails = await appDO.class.getDetails();
    result.push(appDetails.app)
  }
  
  return result
}