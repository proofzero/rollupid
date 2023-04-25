import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, AppPublicPropsSchema } from '../validators/app'

export const GetAppPublicPropsInput = AppClientIdParamSchema

export const GetAppPublicPropsOutput = AppPublicPropsSchema

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
      name: appDetails.app.name,
      iconURL: appDetails.app.icon || '',
      redirectURI: appDetails.app.redirectURI,
      //As app.scopes can be a Set<string>, the following works universally
      scopes: Array.from(appDetails.app.scopes || []),
      termsURL: appDetails.app.termsURL,
      privacyURL: appDetails.app.privacyURL,
    }
  } else {
    throw new Error(
      `Could not return properties for a published application with Client ID: ${input.clientId}`
    )
  }
}
