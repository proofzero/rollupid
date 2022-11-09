import { LoaderFunction, json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/galaxyClient'
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from '~/helpers/voucher'

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error('Profile address required')
  }

  // TODO: double check that this still throws an exception
  // TODO: remove claimed from response?
  try {
    const galaxyClient = await getGalaxyClient()
    // TODO: can we use one call to do the check instead of here?
    // TODO: consider how we would support muliple name services
    if (params.profile.includes('.eth')) {
      try {
        const profileRes = await galaxyClient.getProfileFromName({
          name: params.profile,
        })
        console.log('profileRes', profileRes)
        return json({
          ...profileRes.profileFromName,
          claimed: true,
        })
      } catch (e) {
        return json(`Profile with name ${params.profile} not found`, {
          status: 404,
        })
      }
    }
    const profileRes = await galaxyClient.getProfileFromAddress({
      address: params.profile,
    })

    return json({
      ...profileRes.profileFromAddress,
      claimed: true,
    })
  } catch (e) {
    let voucher = await getCachedVoucher(params.profile)
    if (!voucher) {
      voucher = await fetchVoucher({
        address: params.profile,
      })
      voucher = await putCachedVoucher(params.profile, voucher)
    }

    return json({
      pfp: {
        image: voucher.metadata.image,
        isToken: false,
      },
      cover: voucher.metadata.cover,
      claimed: false,
    })
  }
}
