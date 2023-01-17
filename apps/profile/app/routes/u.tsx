import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { Outlet, useCatch, useOutletContext } from '@remix-run/react'

import { ErrorPage } from '@kubelt/design-system/src/pages/error/ErrorPage'
import type { GetProfileQuery } from '@kubelt/galaxy-client'

export const loader: LoaderFunction = async ({ request, params }) => {
  const { address } = params

  if (!address) {
    throw json(null, { status: 404 })
  }

  return null
}

const UserLayout = () => {
  const { loggedInUserProfile } = useOutletContext<{
    loggedInUserProfile: GetProfileQuery['profile'] | null
  }>()
  return <Outlet context={{ loggedInUserProfile }} />
}

export default UserLayout

export function CatchBoundary() {
  const caught = useCatch()

  let secondary = 'Something went wrong'
  switch (caught.status) {
    case 404:
      secondary = 'Page not found'
      break
  }
  return (
    <div className="grid h-screen place-items-center -mt-20">
      <ErrorPage code={caught.status.toString()} message={secondary} />
    </div>
  )
}
