import createImageClient from '@kubelt/platform-clients/image'
import type { AccountURN } from '@kubelt/urns/account'

export const ogImageFromProfile = async (
  pfp: string,
  accountURN: AccountURN
) => {
  const imageClient = createImageClient(Images, {
    cf: { cacheKey: accountURN, cacheTags: [accountURN] },
  })
  console.time('ogImage')
  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
  })
  console.timeEnd('ogImage')
  return ogImage
}

export const updateOgImageFromProfile = async (pfp: string) => {
  const imageClient = createImageClient(Images)
  const ogImage = await imageClient.updateOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}
