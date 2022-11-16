import { LoaderFunction, redirect } from '@remix-run/cloudflare'
export const loader: LoaderFunction = async ({ request, context }) => {
  return redirect('/authenticate')
}
