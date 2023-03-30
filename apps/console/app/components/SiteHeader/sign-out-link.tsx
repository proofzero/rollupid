import { useSubmit } from '@remix-run/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import { HiOutlineLogout } from 'react-icons/hi'

export default function SignOut({ className }: { className: string }) {
  let submit = useSubmit()

  return (
    <button
      className={`${className} w-full text-left block px-4 py-2
      text-sm  hover:bg-gray-100' w-full text-left
      flex flex-row items-center text-red-500`}
      style={{ cursor: 'pointer' }}
      onClick={() => submit(null, { method: 'post', action: `/signout/` })}
    >
      <HiOutlineLogout size={22} className="mr-2" />
      <Text className="truncate" size="sm" weight="medium">
        Sign Out
      </Text>
    </button>
  )
}
