import type { Environment } from './types'
import type { CloudflareEmailMessage } from '@proofzero/packages/types/email'
import { RelayRecipientHeader } from '@proofzero/types/headers'

export default {
  async email(message: CloudflareEmailMessage, env: Environment) {
    //Format is loosely aaaa-bbb-ccc-ddd.eee@relaydomain
    const emailParts = message.to.split('@')
    if (emailParts.length !== 2) {
      console.error('Unparsable email received', message.to)
      return
    }
    const userParts = emailParts[0].split('.')
    if (userParts.length !== 2) {
      console.error('Unparsable masked email relay address', message.to)
      return
    }
    const envPrefix = userParts[1]

    const distEmailEntries = Object.entries(
      JSON.parse(env.SECRET_EMAIL_DISTRIBUTION_MAP)
    ) as [string, string][]

    const envKeyPair = distEmailEntries.filter(
      ([distributorEnvPrefix]) => distributorEnvPrefix === envPrefix
    )
    if (envKeyPair.length !== 1) {
      console.error('Incorrect relay distribution map configuration')
      return
    } else {
      const [addressEnvSuffix, targetEnvEmail] = envKeyPair[0]
      console.info(
        `Forwarding to env suffix ${addressEnvSuffix} for ${message.to}`
      )
      const newHeaders = new Headers(message.headers)
      newHeaders.append(RelayRecipientHeader, message.to)
      await message.forward(targetEnvEmail, newHeaders)
    }
  },
}
