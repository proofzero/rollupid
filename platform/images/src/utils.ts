import { AccountOrApplicationURN } from './types'

export async function getUniqueCFIdForEntity(
  entity: AccountOrApplicationURN
): Promise<string> {
  const byteString = new TextEncoder().encode(entity)
  const byteHash = await crypto.subtle.digest('SHA-256', byteString)
  const hashArray = Array.from(new Uint8Array(byteHash))
  const digest = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return digest
}
