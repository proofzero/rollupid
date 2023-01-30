import { FaCheckCircle } from 'react-icons/fa'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

export const Links = ({ links }: any) =>
  links && (
    <div className="flex flex-col space-y-4 mt-6 md:mt-10 mx-3 md:mx-0">
      {links.map(
        (
          link: {
            name: string
            url: string
            verified: boolean
          },
          i: number
        ) => (
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
              className="flex flex-row justify-center items-center"
            >
              {link.verified && <FaCheckCircle className="mr-[0.5rem]" />}
              <Text weight="medium" className="text-gray-600">
                {link.name}
              </Text>
            </a>
          </button>
        )
      )}
    </div>
  )
