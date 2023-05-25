import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import { AppClientIdParamSchema, AppPublicPropsSchema } from '../validators/app'
import type { CustomDomain } from '../../types'

export const GetAppPublicPropsInput = AppClientIdParamSchema
export const GetAppPublicPropsOutput = AppPublicPropsSchema

export type GetAppPublicPropsResult = z.infer<typeof GetAppPublicPropsOutput>

export const getAppPublicProps = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppPublicPropsInput>
  ctx: Context
}): Promise<GetAppPublicPropsResult> => {
  const appDO = await getApplicationNodeByClientId(
    input.clientId,
    ctx.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()
  const appTheme = await appDO.class.getTheme()
  const customDomain = await appDO.storage.get<CustomDomain>('customDomain')

  if (appDetails && appDetails.app && appDetails.published) {
    return {
      name: appDetails.app.name,
      iconURL: appDetails.app.icon || '',
      redirectURI: appDetails.app.redirectURI,
      //As app.scopes can be a Set<string>, the following works universally
      scopes: Array.from(appDetails.app.scopes || []),
      termsURL: appDetails.app.termsURL,
      privacyURL: appDetails.app.privacyURL,
      websiteURL: appDetails.app.websiteURL,
      appTheme,
      customDomain: {
        hostname: customDomain?.hostname ?? '',
        isActive:
          Boolean(customDomain?.hostname) &&
          customDomain?.status === 'active' &&
          customDomain?.ssl.status === 'active',
      },
    }
  } else {
    throw new Error(
      `Could not return properties for a published application with Client ID: ${input.clientId}`
    )
  }
}
