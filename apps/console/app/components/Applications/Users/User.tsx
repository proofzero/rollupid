import { Text } from '@kubelt/design-system'
import { Button } from '@kubelt/design-system'
import missingImage from '../../../images/missing-img.svg'

import { HiOutlineExternalLink } from 'react-icons/hi'

export const User = ({
  key,
  PROFILE_APP_URL,
  name,
  imageURL,
  date,
}: {
  key: string
  PROFILE_APP_URL: string
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
text-ellipsis md:space-x-4"
      >
        <img
          src={imageURL || missingImage}
          alt="account pfp"
          className="max-h-[24px] max-w-[24px] rounded-full"
        />
        <Text size="sm" weight="medium" className="text-gray-500 flex-1">
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
        href={`${PROFILE_APP_URL}/p/${key}`}
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
