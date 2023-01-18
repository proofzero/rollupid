import { cacheKey } from './strings'

// TODO: turn into platform client
export default async (
  fgUrl: string | null | undefined,
  gradientSeed: string
) => {
  // let's pick an fg and bg for the og image
  const bg = await Images.fetch(`http://localhost/gradient/${gradientSeed}`, {
    cf: {
      cacheEverything: true,
      cacheTtl: 86400,
      cacheKey: gradientSeed,
    },
  }).then((res) => res.text())
  const fg = fgUrl || bg

  const key = await cacheKey(`og-image-${fgUrl || 'nofg'}-${gradientSeed}`)
  const ogImage = await Images.fetch(
    `http://localhost/ogimage?bg=${bg}&fg=${fg}`,
    {
      cf: {
        cacheEverything: true,
        cacheTtl: 86400,
        cacheKey: key,
      },
    }
  )
    .then((res) => res.text())
    .catch((err) => {
      console.error("Couldn't fetch ogImage", err)
    })

  return {
    ogImage,
    cover: bg,
    pfp: fg,
  }
}

export const ogImageFromProfile = async (pfp: string, cover: string) => {
  const key = await cacheKey(`og-image-${pfp}-${cover}`)
  const ogImage = await Images.fetch(
    `http://localhost/ogimage?bg=${pfp}&fg=${cover}`,
    {
      cf: {
        cacheEverything: true,
        cacheTtl: 86400,
        cacheKey: key,
      },
    }
  )
    .then((res) => res.text())
    .catch((err) => {
      console.error("Couldn't fetch ogImage", err)
    })
  return ogImage
}
