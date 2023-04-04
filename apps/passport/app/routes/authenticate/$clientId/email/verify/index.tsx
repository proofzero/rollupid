import { ERROR_CODES } from '@proofzero/errors'
import { useCatch } from '@remix-run/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export default () => {}
export function CatchBoundary() {
  const caught = useCatch()

  let message = 'Something went terribly wrong!'
  if (caught?.data?.code === ERROR_CODES.BAD_REQUEST) {
    message = caught.data.message
  }

  return (
    <Text
      size="sm"
      weight="medium"
      className="text-red-500 mt-4 mb-2 text-center"
    >
      {message}
    </Text>
  )
}
