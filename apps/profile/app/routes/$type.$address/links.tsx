import { Profile } from '@kubelt/galaxy-client'
import { useOutletContext } from '@remix-run/react'
import { Links as LinksComponent } from '~/components/profile/links/links'

const Links = () => {
  const { finalProfile } = useOutletContext<{
    finalProfile: Profile
  }>()

  return <LinksComponent links={finalProfile.links} />
}

export default Links
