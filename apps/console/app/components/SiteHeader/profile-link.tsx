import { Text } from '@kubelt/design-system/src/atoms/text/Text'

export default function SignOut({ className }: { className: string }) {
  return (
    <a
      className={`${className} hover:cursor-pointer`}
      href="https://my.threeid.xyz/account/"
    >
      <Text className="truncate text-gray-800" size="sm" weight="medium">
        Profile
      </Text>
    </a>
  )
}
