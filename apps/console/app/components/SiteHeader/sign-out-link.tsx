import { useSubmit } from '@remix-run/react'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

export default function SignOut({ className }: { className: string }) {
  let submit = useSubmit()

  return (
    <button
      className={`${className} w-full text-left`}
      onClick={() => submit(null, { method: 'post', action: `/signout/` })}
    >
      <Text className="truncate text-gray-800" size="sm" weight="medium">
        Sign Out
      </Text>
    </button>
  )
}
