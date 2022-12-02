import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getGalaxyClient } from '~/helpers/clients'

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error('Profile address required')
  }

  // address should be reachable if already created
  // TODO: if not we have to do some checking downstream
  const addressURN = `urn:threeid:address/${params.profile}`

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfileFromAddress({
    addressURN,
  })
  console.log({ profileRes })

  if (!profileRes) {
    return json(`Could not resolve profile with name: ${params.profile}`, {
      status: 404,
    })
  }

  // Tempory solution: check profile defaultAddress is the same as params profile
  const claimed = !!profileRes.profileFromAddress?.defaultAddress

  return json(
    {
      ...profileRes.profileFromAddress,
      claimed,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
