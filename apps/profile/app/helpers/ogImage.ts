import ImageClient from '@kubelt/platform-clients/image'

// TODO: turn into platform client
export default async (
  fgUrl: string | null | undefined,
  gradientSeed: string
) => {
  const imageClient = new ImageClient(Images)

  const bg = await imageClient.gradient(gradientSeed)

  const fg = fgUrl || bg

  const ogImage = await imageClient.ogImage(fg, bg)

  return {
    ogImage,
    cover: bg,
    pfp: fg,
  }
}

export const ogImageFromProfile = async (pfp: string, cover: string) => {
  const imageClient = new ImageClient(Images)
  const ogImage = await imageClient.ogImage(pfp, cover)
  return ogImage
}
