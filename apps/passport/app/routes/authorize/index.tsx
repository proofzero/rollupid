import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import { getStabaseClient } from '~/platform.server'
import { Authorization } from '~/components/authorization/Authorization'
import { getUserSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const url = new URL(request.url)
  const client_id = url.searchParams.get('client_id')
  const jwt = await getUserSession(request)

  const sbClient = getStabaseClient()
  try {
    const scopeMeta = await sbClient.kb_appScopes()
    const appProfile = await sbClient.kb_appProfile(client_id)

    return json({ appProfile, userProfile: {}, scopeMeta })
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
