import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'

export const GetAppNameInput = z.string()
export const GetAppNameOutput = z.string().optional()

export const GetAppNameBatchInput = z.array(z.string())
export const GetAppNameBatchOutput = z.array(
  AppClientIdParamSchema.merge(
    z.object({
      name: z.string().optional(),
    })
  )
)

export type GetAppNameResult = z.infer<typeof GetAppNameOutput>

export const getAppName = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppNameInput>
  ctx: Context
}): Promise<GetAppNameResult> => getNameForApp(ctx, input)

export const getAppNameBatch = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppNameBatchInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppNameBatchOutput>> =>
  Promise.all(
    input.map(async (clientID) => ({
      clientId: clientID,
      name: await getNameForApp(ctx, clientID),
    }))
  )

async function getNameForApp(ctx: Context, clientID: string) {
  const appDO = await getApplicationNodeByClientId(
    clientID,
    ctx.env.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()
  return appDetails.app?.name
}
