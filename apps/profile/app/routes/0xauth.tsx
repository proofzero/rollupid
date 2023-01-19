import { json, LoaderFunction } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams

  return json({
    code: params.get('code'),
    state: params.get('state'),
  })
}
