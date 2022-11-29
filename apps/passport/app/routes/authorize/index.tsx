import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import {
  getAddressClient,
  getAddressClientFromURN,
  getGalaxyClient,
  getStabaseClient as getStarbaseClient,
} from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')

  if (!client_id) {
    throw json(
      { message: 'No app to authorize provided', isAuthenticated: true },
      400
    )
  }

  const session = await getUserSession(request)

  const galaxyClient = await getGalaxyClient()
  const profileRes = await galaxyClient.getProfile(undefined, {
    'KBT-Access-JWT-Assertion': session.get('jwt'),
  })

  let profile
  if (!profileRes.profile) {
    console.log('no profile found, creating one')
    const defaultProfileURN = session.get('defaultProfileUrn')
    console.log({ defaultProfileURN })
    const addressClient = getAddressClientFromURN(defaultProfileURN)
    profile = await addressClient.kb_getAddressProfile()
    if (!profile) {
      throw json("Couldn't find profile", 400)
    }
    const updated = await galaxyClient.updateProfile(
      { profile },
      {
        'KBT-Access-JWT-Assertion': session.get('jwt'),
      }
    )
    if (!updated) {
      throw json("Couldn't update profile", 400)
    }
  } else {
    profile = profileRes.profile
  }

  if (!profile) {
    throw json({ message: 'No profile found', isAuthenticated: true }, 400)
  }

  // if profile is null we need to provisio a default profile
  // we can do that by getting the address profile and then setting the account profile
  // TODO: create a get address profile galaxy operation
  // TODO: call set profile mutation from galaxy

  try {
    const sbClient = getStarbaseClient()
    const scopeMeta = await sbClient.kb_appScopes()
    const appProfile = await sbClient.kb_appProfile(client_id)

    return json({
      appProfile,
      userProfile: profile,
      scopeMeta,
    })
  } catch (e) {
    console.error(e)
    throw json({ message: 'Failed to fetch application info' }, 400)
  }
}

export default function Authorize() {
  const { appProfile, userProfile, scopeMeta } = useLoaderData()
  return (
    <Authorization
      appProfile={appProfile}
      userProfile={userProfile}
      scopeMeta={scopeMeta}
    />
  )
}
