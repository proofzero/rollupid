import { ERROR_CODES } from '@proofzero/errors'
import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useCatch } from '@remix-run/react'
import { loader as otpLoader } from '~/routes/connect/email/otp'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const otpLoaderRes = await otpLoader({ request, context, params })
  const resJSON = await otpLoaderRes.json()

  return json({
    state: resJSON.state,
  })
}

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
