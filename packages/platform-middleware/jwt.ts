import { AccountURN } from '@kubelt/urns/account'
import * as jose from 'jose'

export const AccountJWTHeader = 'KBT-Access-JWT-Assertion'

export const AccountJWTFromHeader = (header: string) => {
  const jwt = jose.decodeJwt(header)
  const accountURN: AccountURN = jwt && (jwt.sub as AccountURN)
  return {
    accountURN,
  }
}
