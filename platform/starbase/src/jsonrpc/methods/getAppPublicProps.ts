import { z } from 'zod'
import { Context } from '../context'
import { getApplicationNodeByClientId } from '../../nodes/application'
import {
  AppClientIdParamSchema,
  AppPublicProps,
  AppPublicPropsSchema,
} from '../validators/app'
import type { CustomDomain } from '../../types'
import { ServicePlanType } from '@proofzero/types/billing'

export const GetAppPublicPropsInput = AppClientIdParamSchema.merge(
  z.object({
    previewMode: z.boolean().optional(),
  })
)

export const GetAppPublicPropsOutput = AppPublicPropsSchema
export const GetAppPublicPropsBatchInput = z.object({
  apps: z.array(GetAppPublicPropsInput),
  silenceErrors: z.boolean().default(false),
})
export const GetAppPublicPropsBatchOutput = z.array(
  AppPublicPropsSchema.optional()
)

export type GetAppPublicPropsResult = z.infer<typeof GetAppPublicPropsOutput>

export const getAppPublicProps = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppPublicPropsInput>
  ctx: Context
}): Promise<GetAppPublicPropsResult> => {
  return await getPublicPropsForApp(ctx, input.clientId, input.previewMode)
}

export const getAppPublicPropsBatch = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof GetAppPublicPropsBatchInput>
  ctx: Context
}): Promise<z.infer<typeof GetAppPublicPropsBatchOutput>> => {
  const { apps, silenceErrors } = input
  const resultMap: (AppPublicProps | undefined)[] = []
  for (const { clientId, previewMode } of apps) {
    let appResult
    try {
      appResult = await getPublicPropsForApp(ctx, clientId, previewMode)
    } catch (e) {
      if (silenceErrors) appResult = undefined
      else throw e
    }
    resultMap.push(appResult)
  }
  return resultMap
}

async function getPublicPropsForApp(
  ctx: Context,
  clientId: string,
  previewMode?: boolean
) {
  const appDO = await getApplicationNodeByClientId(
    clientId,
    ctx.env.StarbaseApp
  )
  const appDetails = await appDO.class.getDetails()
  const { appPlan } = appDetails

  let appTheme = await appDO.class.getTheme()
  if (!previewMode && (!appPlan || appPlan === ServicePlanType.FREE)) {
    appTheme = undefined
  }

  let customDomain = await appDO.storage.get<CustomDomain>('customDomain')
  if (!appPlan || appPlan === ServicePlanType.FREE) {
    customDomain = undefined
  }

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
            customDomain?.dns_records
              ?.filter((r) => r.required)
              .every((r) => r.value?.includes(r.expected_value))
          ),
      },
    }
  } else {
    throw new Error(
      `Could not return properties for a published application with Client ID: ${clientId}`
    )
  }
}
