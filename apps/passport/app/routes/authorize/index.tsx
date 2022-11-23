import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import {
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

  // if profile is null we need to provisio a default profile
  // we can do that by getting the address profile and then setting the account profile
  // TODO: create a get address profile galaxy operation
  // TODO: call set profile mutation from galaxy

  try {
    const sbClient = getStarbaseClient()
    const scopeMeta = await sbClient.kb_appScopes()
    console.log('scopeMeta', scopeMeta)
    console.log('client_id', client_id)
    const appProfile = await sbClient.kb_appProfile(client_id)
    console.log('appProfile', appProfile)

    return json({
      appProfile,
      userProfile: profileRes.profile || {},
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
