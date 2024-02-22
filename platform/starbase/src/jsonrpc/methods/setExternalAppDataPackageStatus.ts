import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ExternalAppDataPackageStatus } from '../validators/externalAppDataPackageDefinition'

export const SetExternalAppDataPackageStatusInputSchema =
  AppClientIdParamSchema.extend({
    status: z.nativeEnum(ExternalAppDataPackageStatus),
  })
type SetExternalAppDataPackageStatusInput = z.infer<
  typeof SetExternalAppDataPackageStatusInputSchema
>

export const setExternalAppDataPackageStatus = async ({
  input,
  ctx,
}: {
  input: SetExternalAppDataPackageStatusInput
  ctx: Context
}): Promise<void> => {
  const { clientId, status } = input

  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )

  await appDO.class.setExternalAppDataPackageStatus(status)
}
