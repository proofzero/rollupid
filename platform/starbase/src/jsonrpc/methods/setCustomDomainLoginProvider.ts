import { z } from 'zod'

import { Context } from '../context'
import {
  CustomDomainSchema,
  CustomDomainLoginProviders,
  CustomDomainLoginProviderConfigSchema,
} from '../validators/customdomain'
import { getApplicationNodeByClientId } from '../../nodes/application'

export const SetCustomDomainLoginProviderInput = z.object({
  clientId: z.string(),
  type: CustomDomainLoginProviders,
  config: CustomDomainLoginProviderConfigSchema,
})
export const SetCustomDomainLoginProviderOutput = z.void()

type SetCustomDomainLoginProviderInput = z.infer<
  typeof SetCustomDomainLoginProviderInput
>
type SetCustomDomainLoginProviderOutput = z.infer<
  typeof SetCustomDomainLoginProviderOutput
>

type SetCustomDomainLoginProviderParams = {
  input: SetCustomDomainLoginProviderInput
  ctx: Context
}

interface SetCustomDomainLoginProviderMethod {
  (
    params: SetCustomDomainLoginProviderParams
  ): Promise<SetCustomDomainLoginProviderOutput>
}

export const setCustomDomainLoginProvider: SetCustomDomainLoginProviderMethod =
  async ({ input, ctx }) => {
    const { clientId, type, config } = input
    const node = await getApplicationNodeByClientId(clientId, ctx.StarbaseApp)

    const stored = await node.storage.get<z.infer<typeof CustomDomainSchema>>(
      'customDomain'
    )

    if (!stored) return
    if (!stored.loginProviders) stored.loginProviders = {}
    stored.loginProviders[type] = config
    await node.storage.put('customDomain', stored)
  }
