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
}

export const Links = ({ links }: LinksProps) =>
  links && (
    <div className="flex flex-col space-y-4 mx-3 md:mx-0">
      {links
        .map((link) => ({
          ...link,
          providerIcon: imageFromAddressType(link.provider),
        }))
        .map((link, i: number) => (
          <button
            key={`${link.name}-${link.url}-${i}`}
            className="
          bg-gray-100 hover:bg-gray-200
          transition-colors
          rounded-full
          justify-center
          items-center
          w-full
          py-5"
          >
            <a
              href={link.url}
              className="flex flex-row justify-center items-center space-x-2.5"
            >
              {link.providerIcon && (
                <img src={link.providerIcon} className="w-5 h-5" />
              )}
              <Text weight="medium" className="text-gray-600">
                {link.name}
              </Text>
            </a>
          </button>
        ))}
    </div>
  )
