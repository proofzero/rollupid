import { LoaderFunction, redirect } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request, params }) => {
  return redirect(`/${params.profile}/collection`)
}
