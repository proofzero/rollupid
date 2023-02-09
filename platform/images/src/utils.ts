import { AccountOrApplicationURN } from './types'

export async function getUniqueCFIdForEntity(
  entity: AccountOrApplicationURN
): Promise<string> {
  const byteString = new TextEncoder().encode(entity)
  const byteHash = await crypto.subtle.digest('SHA-256', byteString)
  return new TextDecoder().decode(new Uint8Array(byteHash))
}
