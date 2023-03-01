import createImageClient from '@kubelt/platform-clients/image'

export const ogImageFromProfile = async (pfp: string, cover: string) => {
  const imageClient = createImageClient(Images)

  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
    bgUrl: cover,
  })
  return ogImage
}
