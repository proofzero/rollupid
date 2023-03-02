import createImageClient from '@kubelt/platform-clients/image'

const imageClient = createImageClient(Images)
//   cf: { cacheKey: accountURN, cacheTags: [accountURN] },
//

export const ogImageFromProfile = async (pfp: string) => {
  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}

export const updateOgImageFromProfile = async (pfp: string) => {
  const ogImage = await imageClient.updateOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}
