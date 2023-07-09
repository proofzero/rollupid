import { z } from 'zod'

import { Context } from '../context'
import {
  CustomDomainSchema,
  CustomDomainLoginProviders,
  CustomDomainLoginProviderConfigSchema,
} from '../validators/customdomain'
import { getApplicationNodeByClientId } from '../../nodes/application'

export const GetCustomDomainLoginProviderInput = z.object({
  clientId: z.string(),
  type: CustomDomainLoginProviders,
})
export const GetCustomDomainLoginProviderOutput = z.optional(
  CustomDomainLoginProviderConfigSchema
)

type GetCustomDomainLoginProviderInput = z.infer<
  typeof GetCustomDomainLoginProviderInput
>
type GetCustomDomainLoginProviderOutput = z.infer<
  typeof GetCustomDomainLoginProviderOutput
>

type GetCustomDomainLoginProviderParams = {
  input: GetCustomDomainLoginProviderInput
  ctx: Context
}

interface GetCustomDomainLoginProviderMethod {
  (
    params: GetCustomDomainLoginProviderParams
  ): Promise<GetCustomDomainLoginProviderOutput>
}

export const getCustomDomainLoginProvider: GetCustomDomainLoginProviderMethod =
  async ({ input, ctx }) => {
    const { clientId, type } = input
    const node = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)

    const stored = await node.storage.get<z.infer<typeof CustomDomainSchema>>(
      'customDomain'
    )
    if (!stored) return
    if (!stored.loginProviders) return
    return stored.loginProviders[type]
  }
