import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema } from '../validators/app'

export const GetAppPublicPropsInput = AppClientIdParamSchema

export const GetAppPublicPropsOutput = z.object({
  name: z.string(),
  iconURL: z.string(),
})

export const getAppPublicProps = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppPublicPropsInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppPublicPropsOutput>> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()

  if (appDetails && appDetails.app && appDetails.published) {
    return {
      name: appDetails.app?.name,
      iconURL: appDetails.app?.icon || '',
    }
  } else {
    throw new Error(
      `Could not return properties for a published application with Client ID: ${input.clientId}`
    )
  }
}
