import { useOutletContext } from '@remix-run/react'
import { Links as LinksComponent } from '~/components/profile/links/links'

const Links = () => {
  const { profile } = useOutletContext<{
    profile: {
      links: {
        name: string
        url: string
        verified: boolean
        provider: string
      }[]
    }
  }>()

  return <LinksComponent links={profile.links} />
}

export default Links
