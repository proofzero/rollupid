import { LoaderFunction } from '@remix-run/cloudflare'
import { getAuthorizedApps } from '~/helpers/profile'
import { requireJWT } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  // Letting error bubble hits
  // root ErrorBoundary on client-side
  // so return object with error property
  try {
    const apps = await getAuthorizedApps(jwt)

    return {
      apps,
    }
  } catch (ex) {
    console.log('Error while fetching authorized apps')
    console.error(ex)

    return {
      error: true,
    }
  }
}
