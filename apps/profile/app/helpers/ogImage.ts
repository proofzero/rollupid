import createImageClient from '@kubelt/platform-clients/image'
import type { AccountURN } from '@kubelt/urns/account'

export const ogImageFromProfile = async (
  pfp: string,
  cover: string,
  accountURN: AccountURN
) => {
  const imageClient = createImageClient(Images, {
    cf: { cacheKey: accountURN, cacheTags: [accountURN] },
  })

  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
    bgUrl: cover,
  })
  return ogImage
}
