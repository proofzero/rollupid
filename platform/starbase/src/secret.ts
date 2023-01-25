// platform/starbase/src/secret.ts

// hash
// -----------------------------------------------------------------------------

export async function hash(s: string): Promise<string> {
  const data = new TextEncoder().encode(s)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
