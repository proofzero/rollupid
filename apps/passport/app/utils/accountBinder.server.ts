import { AccountURN } from '@kubelt/urns/account'
import { getUserSession, parseJwt } from '~/session.server'

export const setOrCreateAccount = async (
  addressClient: any,
  request: Request,
  env: Env
): Promise<AccountURN> => {
  const userSession = await getUserSession(request, env)
  const jwt = userSession.get('jwt')

  let account: AccountURN
  if (jwt) {
    account = parseJwt(jwt).sub as AccountURN

    await addressClient.setAccount.mutate(account)
  } else {
    account = await addressClient.resolveAccount.query()
  }

  return account
}
