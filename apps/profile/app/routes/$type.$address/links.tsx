import { useOutletContext } from '@remix-run/react'
import { Links as LinksComponent } from '~/components/profile/links/links'

const Links = () => {
  const { profile, isOwner } = useOutletContext<{
    profile: {
      links: {
        name: string
        url: string
        verified: boolean
        provider: string
      }[]
      displayName: string
    }
    isOwner: boolean
  }>()

  return (
    <LinksComponent
      links={profile.links}
      isOwner={isOwner}
      displayName={profile.displayName}
    />
  )
}

export default Links
