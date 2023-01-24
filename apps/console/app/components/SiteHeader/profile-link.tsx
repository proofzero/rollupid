import { Text } from '@kubelt/design-system/src/atoms/text/Text'

export default function SignOut({
  className,
  profileURL,
}: {
  className: string
  profileURL: string
}) {
  return (
    <a className={`${className} hover:cursor-pointer`} href={profileURL}>
      <Text className="truncate text-gray-800" size="sm" weight="medium">
        Profile
      </Text>
    </a>
  )
}
