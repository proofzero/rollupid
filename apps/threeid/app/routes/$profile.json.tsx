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
    if (params.profile.endsWith('.eth')) {
      const profileRes = await galaxyClient.getProfileFromName({
        name: params.profile,
      })
      return json({
        ...profileRes.profileFromName,
        claimed: true,
      })
    }
    const profileRes = await galaxyClient.getProfileFromAddress({
      address: params.profile,
    })

    console.log('HEREHEHR')

    return json({
      ...profileRes.profileFromAddress,
      claimed: true,
    })
  } catch (e) {
    console.error("Couldn't find profile", e.response.errors[0])
    if (e.response.errors) {
      // we have a handled exception from galaxy
      const status = e.response.errors[0].extensions.extensions.http.status
      console.log('here', status)
      const error = `Failed to fetch profile with with resolver ${params.profile}: ${e.response.errors[0].message}`
      console.error(status, error)
      return json(error, {
        status: status,
      })
    }

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
