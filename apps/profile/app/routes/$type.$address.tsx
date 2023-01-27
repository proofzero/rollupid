import { Profile } from '@kubelt/galaxy-client'
import { Outlet, useOutletContext } from '@remix-run/react'

export default function Index() {
  const outletContext = useOutletContext<{ loggedInUserProfile: Profile }>()

  const { loggedInUserProfile } = outletContext

  return <Outlet context={{ profile: loggedInUserProfile }}></Outlet>
}
