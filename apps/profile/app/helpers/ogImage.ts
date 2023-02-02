import createImageClient from '@kubelt/platform-clients/image'

// TODO: turn into platform client
export default async (
  fgUrl: string | null | undefined,
  gradientSeed: string
) => {
  const imageClient = createImageClient(Images)

  const bg = await imageClient.getGradient.mutate({ gradientSeed })

  const fg = fgUrl || bg

  const ogImage = await imageClient.getOgImage.query({ fgUrl: fg, bgUrl: bg })

  return {
    ogImage,
    cover: bg,
    pfp: fg,
  }
}

export const ogImageFromProfile = async (pfp: string, cover: string) => {
  const imageClient = createImageClient(Images)
  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
    bgUrl: cover,
  })
  return ogImage
}
