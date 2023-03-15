import { useSubmit } from '@remix-run/react'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { IoMdExit } from 'react-icons/io'
import { IoIosCheckmark } from 'react-icons/io'

export function SignOutLink({ className }: { className: string }) {
  let submit = useSubmit()

  return (
    <button
      className={`${className} w-full text-left`}
      style={{ cursor: 'pointer' }}
      onClick={() => submit(null, { method: 'post', action: `/signout/` })}
    >
      <Text className="truncate" size="sm" weight="medium">
        Sign Out
      </Text>
    </button>
  )
}

export const UserNavigation = ({
  avatarUrl,
  displayName,
  profileUrl,
}: {
  avatarUrl?: string
  displayName?: string
  profileUrl?: string
}) => {
  const submit = useSubmit()

  return (
    <>
      <div className="pl-3 pr-2 py-2 flex w-full flex-col">
        <Text size="xs" className="text-gray-500">
          CURRNETLY IN
        </Text>
        <div className="flex flex-row items-center mt-2">
          <img
            src={avatarUrl}
            alt="PFP loading error"
            className="h-[24px] w-[24px] rounded-full mr-2"
          />
          <Text size="sm" className="max-w-[122px] truncate">
            {displayName}
          </Text>
          <IoIosCheckmark className="ml-2 text-indigo-500" size={26} />
        </div>
      </div>
      <a
        className="pl-3 pr-2 py-3 hover:bg-gray-100 
        w-full text-left flex items-center border text-gray-700"
        style={{ cursor: 'pointer' }}
        href={profileUrl}
        target="_blank"
        rel="noreferrer"
      >
        <HiOutlineExternalLink size={22} className="mr-2" />
        <Text className="truncate" size="sm" weight="medium">
          Open my Profile
        </Text>
      </a>
      <button
        className="pl-3 pr-2 py-3 hover:bg-gray-100 w-full
         text-left flex items-center text-red-500"
        style={{ cursor: 'pointer' }}
        onClick={() => submit(null, { method: 'post', action: '/signout/' })}
      >
        <IoMdExit size={22} className="mr-2" />
        <Text className="truncate" size="sm" weight="medium">
          Sign Out
        </Text>
      </button>
    </>
  )
}
