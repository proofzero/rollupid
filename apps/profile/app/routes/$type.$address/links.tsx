import { Profile } from '@kubelt/galaxy-client'
import { useOutletContext } from '@remix-run/react'
import { Links as LinksComponent } from '~/components/profile/links/links'

const Links = () => {
  const { profile } = useOutletContext<{
    profile: {
      links: {
        name: string
        url: string
        verified: string
      }
    }
  }>()

  return <LinksComponent links={profile.links} />
}

export default Links
