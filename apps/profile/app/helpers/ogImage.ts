import createImageClient from '@kubelt/platform-clients/image'

export const ogImageFromProfile = async (pfp: string) => {
  const imageClient = createImageClient(Images)
  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}

export const updateOgImageFromProfile = async (pfp: string) => {
  const imageClient = createImageClient(Images)
  const ogImage = await imageClient.updateOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}
