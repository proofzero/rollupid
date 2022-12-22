import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'
import { ThreeIdProfile } from '~/utils/galaxy.server'

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error('Profile address required')
  }
  const galaxyClient = await getGalaxyClient()

  const { ensAddress } = await galaxyClient.getEnsAddress({
    addressOrEns: params.profile,
  })

  // address should be reachable if already created
  // TODO: if not we have to do some checking downstream
  const addressURN = `urn:threeid:address/${ensAddress}`

  const profileRes = await galaxyClient.getProfileFromAddress({
    addressURN,
  })

  if (!profileRes) {
    return json(`Could not resolve profile with name: ${params.profile}`, {
      status: 404,
    })
  }

  const profile = profileRes.profileFromAddress as ThreeIdProfile

  // Tempory solution: check profile defaultAddress is the same as params profile
  const claimed = !!profile.defaultAddress

  return json(
    {
      ...profile,
      claimed,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
