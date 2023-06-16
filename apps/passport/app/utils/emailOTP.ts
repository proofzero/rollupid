export const generateEmailOTP = async (
  email: string
): Promise<{ message: string; state: string; status: number } | undefined> => {
  const reqUrl = `/connect/email/otp?email=${encodeURIComponent(email)}`

  const resObj = await fetch(reqUrl)
  const res = await resObj.json<{
    message: string
    state: string
  }>()

  return { message: res.message, state: res.state, status: resObj.status }
}
