import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppPublicProps,
  AppPublicPropsSchema,
} from '../validators/app'
import type { CustomDomain } from '../../types'

export const GetAppPublicPropsInput = AppClientIdParamSchema
export const GetAppPublicPropsOutput = AppPublicPropsSchema
export const GetAppPublicPropsBatchInput = z.array(GetAppPublicPropsInput)
export const GetAppPublicPropsBatchOutput = z.map(
  z.string(),
  AppPublicPropsSchema
)

export type GetAppPublicPropsResult = z.infer<typeof GetAppPublicPropsOutput>

export const getAppPublicProps = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppPublicPropsInput>
  ctx: Context
}): Promise<GetAppPublicPropsResult> => {
  return await getPublicPropsForApp(input.clientId, ctx)
}

export const getAppPublicPropsBatch = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppPublicPropsBatchInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppPublicPropsBatchOutput>> => {
  const resultMap: Map<string, AppPublicProps> = new Map()
  for (const { clientId } of input) {
    resultMap.set(clientId, await getPublicPropsForApp(clientId, ctx))
  }
  return resultMap
}

async function getPublicPropsForApp(clientId: string, ctx: Context) {
  const appDO = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)
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
          customDomain?.ssl.status === 'active' &&
          Boolean(
            customDomain?.dns_records?.every((r) =>
              r.value?.includes(r.expected_value)
            )
          ),
      },
    }
  } else {
    throw new Error(
      `Could not return properties for a published application with Client ID: ${clientId}`
    )
  }
}
