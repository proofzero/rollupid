import {
  CryptoAddressType,
  EmailAddressType,
  OAuthAddressType,
} from '@proofzero/types/address'

const calculateVisibleChars = (
  alias: string,
  percentage: number = 0.2
): number => {
  const visibleCharCount = Math.max(Math.floor(alias.length * percentage), 1)
  return Math.max(1, Math.floor(visibleCharCount / 2))
}

const obfuscateEmailOrCryptoAlias = (
  alias: string,
  visibleChars: number
): string => {
  const isEmail = alias.includes('@')
  const obfuscatedPart = `${'*'.repeat(2)}${isEmail ? '@' : ''}${'*'.repeat(2)}`

  return `${alias.slice(0, visibleChars)}${obfuscatedPart}${alias.slice(
    -visibleChars
  )}`
}

const obfuscateOauthAlias = (alias: string, visibleChars: number): string => {
  const [identifier, domain] = alias.split('@')
  const obfuscatedIdentifier = `${identifier.slice(
    0,
    visibleChars
  )}${'*'.repeat(2)}${identifier.slice(-visibleChars)}`

  return domain ? `${obfuscatedIdentifier}@${domain}` : obfuscatedIdentifier
}

export const obfuscateAlias = (
  alias: string,
  addressType: CryptoAddressType | EmailAddressType | OAuthAddressType
): string => {
  const visibleChars = calculateVisibleChars(alias)

  switch (addressType) {
    case EmailAddressType.Email:
    case CryptoAddressType.ETH:
      return obfuscateEmailOrCryptoAlias(alias, visibleChars)
    default:
      return obfuscateOauthAlias(alias, visibleChars)
  }
}
