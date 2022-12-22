import social from '~/assets/social.png'

export default async (
  bkg: string,
  hex: string,
  cacheKey: string
): Promise<string> => {
  const ogImage = await fetch(`${NFTAR_URL}/v0/og-image`, {
    cf: {
      cacheEverything: true,
      cacheTtl: 3600,
      cacheKey,
    },
    method: 'POST',
    headers: {
      authorization: `Bearer ${TOKEN_NFTAR}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      bkg,
      hex,
    }),
  })
    .then(async (res) => await res.json())
    .then((json) => json.url as string)
    .catch((err) => {
      console.error(
        `threeid.profile: JSON converstion failed for og:image generator. Using default social image: ${err}`
      )
      return social
    })
  return ogImage
}
