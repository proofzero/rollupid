const cacheKey = async (key: string) => {
  const cacheKeyEnc = new TextEncoder().encode(key)
  const cacheKeyDigest = await crypto.subtle.digest('SHA-256', cacheKeyEnc)
  const cacheKeyArray = Array.from(new Uint8Array(cacheKeyDigest))
  return cacheKeyArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default class ImageClient {
  declare fetcher: Fetcher

  constructor(fetcher: Fetcher) {
    this.fetcher = fetcher
  }

  async gradient(gradientSeed: string) {
    return this.fetcher
      .fetch(`http://localhost/gradient/${gradientSeed}`, {
        cf: {
          cacheEverything: true,
          cacheTtl: 86400,
          cacheKey: gradientSeed,
        },
      })
      .then((res) => res.text())
  }

  async ogImage(fg: string, bg: string) {
    const key = await cacheKey(`og-image-${fg}-${bg}`)
    const ogImage = await this.fetcher
      .fetch(`http://localhost/ogimage?bg=${fg}&fg=${bg}`, {
        cf: {
          cacheEverything: true,
          cacheTtl: 86400,
          cacheKey: key,
        },
      })
      .then((res) => res.text())
      .catch((err) => {
        console.error("Couldn't fetch ogImage", err)
      })
    return ogImage
  }
}
