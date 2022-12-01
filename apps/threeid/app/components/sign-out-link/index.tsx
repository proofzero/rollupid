import { useSubmit } from '@remix-run/react'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

export default function SignOut({ className }: { className: string }) {
  let submit = useSubmit()

  return (
    <a
      className={className}
      style={{ cursor: 'pointer' }}
      onClick={() => submit(null, { method: 'post', action: `/auth/signout/` })}
    >
      <Text className="truncate text-gray-800" size="sm" weight="medium">
        Sign Out
      </Text>
    </a>
  )
}
