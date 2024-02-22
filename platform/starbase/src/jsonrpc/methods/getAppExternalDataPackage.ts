import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { ExternalAppDataPackageStatus } from '../validators/externalAppDataPackageDefinition'

export const GetAppExternalDataPackageInputSchema = AppClientIdParamSchema
export const GetAppExternalDataPackageOutputSchema = z
  .object({
    packageType: z.nativeEnum(ExternalAppDataPackageType),
    reads: z.number(),
    writes: z.number(),
    status: z.nativeEnum(ExternalAppDataPackageStatus),
  })
  .optional()

type GetAppExternalDataPackageInput = z.infer<
  typeof GetAppExternalDataPackageInputSchema
>
type GetAppExternalDataPackageOutput = z.infer<
  typeof GetAppExternalDataPackageOutputSchema
>

export const getAppExternalDataPackage = async ({
  input,
  ctx,
}: {
  input: GetAppExternalDataPackageInput
  ctx: Context
}): Promise<GetAppExternalDataPackageOutput> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.env.StarbaseApp
  )
  const { externalAppDataPackageDefinition } = await appDO.class.getDetails()
  if (!externalAppDataPackageDefinition) {
    return externalAppDataPackageDefinition
  }

  const { packageDetails } = externalAppDataPackageDefinition

  return {
    packageType: packageDetails.packageType,
    reads: packageDetails.reads,
    writes: packageDetails.writes,
    status: externalAppDataPackageDefinition.status,
  }
}
