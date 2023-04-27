import { redirect } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = ({ request, context }) => {
  const currentRoute =
    new URL(context.env.PASSPORT_REDIRECT_URL).origin + '/create'

  // check if are not going to /create/wallet route or similar behavior
  if (request.url === currentRoute) {
    return redirect('/authenticate/passport')
  }

  return null
}
