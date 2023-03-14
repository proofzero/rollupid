import { useSubmit } from '@remix-run/react'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

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
