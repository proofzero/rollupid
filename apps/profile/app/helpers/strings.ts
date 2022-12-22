export const shortenedAccount = (targetAddress: string) => {
  return `${targetAddress.substring(0, 4)} ... ${targetAddress.substring(
    targetAddress.length - 4
  )}`
}

export const cacheKey = async (key: string) => {
  const cacheKeyEnc = new TextEncoder().encode(key)
  const cacheKeyDigest = await crypto.subtle.digest('SHA-256', cacheKeyEnc)
  const cacheKeyArray = Array.from(new Uint8Array(cacheKeyDigest))
  return cacheKeyArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
