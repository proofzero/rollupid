import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { imageFromAddressType } from '~/helpers'

type Link = {
  name: string
  url: string
  verified: boolean
  provider: string
}

type LinksProps = {
  links: Link[]
  isOwner: boolean
  displayName: string
}

export const Links = ({ links, isOwner = false, displayName }: LinksProps) => {
  if (!links || links.length === 0) {
    if (isOwner) {
      return (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          Looks like you haven't set any links
        </Text>
      )
    } else {
      return (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          Looks like {displayName} hasn't set any links
        </Text>
      )
    }
  }

  return (
    <div className="flex flex-col space-y-4 mx-3 md:mx-0">
      {links
        .map((link) => ({
          ...link,
          providerIcon: imageFromAddressType(link.provider),
        }))
        .map((link, i: number) => (
          <a
            key={`${link.name}-${link.url}-${i}`}
            href={link.url}
            className="flex flex-row justify-center items-center space-x-2.5
            bg-gray-100 hover:bg-gray-200 transition-colors
            rounded-full justify-center items-center w-full py-5"
            rel="noreferrer"
            target="_blank"
          >
            {link.providerIcon && (
              <img
                src={link.providerIcon}
                alt="Something went wrong..."
                className="w-5 h-5"
              />
            )}
            <Text weight="medium" className="text-gray-600">
              {link.name}
            </Text>
          </a>
        ))}
    </div>
  )
}
