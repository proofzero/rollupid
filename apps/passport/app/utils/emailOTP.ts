import { getErrorCause } from '@proofzero/utils/errors'

export const generateEmailOTP = async (
  email: string
): Promise<{ message: string; state: string; status: number } | undefined> => {
  const reqUrl = `/connect/email/otp?email=${encodeURIComponent(email)}`

  const res = await fetch(reqUrl)

  const resObj = await res.json<{
    message: string
    state: string
  }>()

  if (!res.ok) {
    throw getErrorCause(resObj)
  }

  return { message: resObj.message, state: resObj.state, status: res.status }
}
