import { Text } from '@proofzero/design-system'
import { Button } from '@proofzero/design-system'
import missingImage from '../../../images/missing-img.svg'

import { HiOutlineExternalLink } from 'react-icons/hi'

export const User = ({
  publicProfileURL,
  name,
  imageURL,
  date,
}: {
  publicProfileURL: string
  name?: string
  imageURL?: string
  date?: string
}) => {
  return (
    <article className="flex items-center py-5 px-8 border-t">
      <div
        className="flex-1 flex flex-col
items-start
md:flex-row md:items-center
text-ellipsis md:space-x-4 truncate"
      >
        <img
          src={imageURL}
          alt="pfp"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src = missingImage
            currentTarget.style.filter = 'brightness(88%)'
          }}
          className="max-h-[24px] max-w-[24px] rounded-full"
        />
        <Text
          size="sm"
          weight="medium"
          className="text-gray-500 flex-1 w-full truncate"
        >
          {name}
        </Text>
      </div>

      <Text
        size="sm"
        weight="medium"
        className="text-ellipsis text-gray-500
 flex-1 px-2"
      >
        {date}
      </Text>
      <a
        className="flex-1 flex justify-end"
        href={publicProfileURL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          btnType="secondary-alt"
          className="right-0 flex md:flex-row flex-col max-w-max
text-xs leading-4 items-center md:space-x-2"
        >
          <HiOutlineExternalLink size={22} />
          Public Profile
        </Button>
      </a>
    </article>
  )
}
