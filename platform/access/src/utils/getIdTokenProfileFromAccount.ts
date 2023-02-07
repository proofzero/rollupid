import { AccountURN } from '@kubelt/urns/account'
import { Context } from '../context'
import { IdTokenProfile } from '../types'

export default async function (
  account: AccountURN,
  ctx: Context
): Promise<IdTokenProfile> {
  const accountProfile = await ctx.accountClient.getProfile.query({ account })
  if (!accountProfile || !accountProfile.displayName || !accountProfile.pfp) {
    console.error('getIdTokenProfileForAccount', { accountProfile })
    throw new Error(
      `Could not read account details for account ${account} to encode into ID token.`
    )
  }
  return {
    name: accountProfile?.displayName,
    picture: accountProfile?.pfp.image,
  }
}
