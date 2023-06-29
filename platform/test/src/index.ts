import { IRequest, RequestLike, Router } from 'itty-router'

import type { Environment, CloudflareEmailMessage } from './types'

const router = Router() // no "new", as this is not a real class

const withToken = (request: IRequest, env: Environment) => {
  if (!env.SECRET_TEST_API_TOKEN) {
    return new Response('Missing Auth Token', { status: 401 })
  }
  if (
    request.headers.get('Authentication') !==
    `Bearer ${env.SECRET_TEST_API_TOKEN}`
  ) {
    return new Response('Unauthorized', { status: 401 })
  }
}

router.get('/otp/:email', withToken, async (req, env) => {
  const { params } = req

  const otp = await env.otp_test.get(params.email)

  console.debug('OTP GET: ', params.email, otp)
  return new Response(otp)
})

router.post('/otp/:email', withToken, async (req, env) => {
  const { params } = req
  const otpMessage = await req.text()
  const otp = parseOTPFromMessage(otpMessage)

  console.log({ to: params.email, otp })

  await env.otp_test.put(params.email, otp)
  return new Response(otp)
})

router.post('/notification/:email', withToken, async (req, env) => {
  const { params } = req
  const message = await req.text()

  console.log({ to: params.email })
  console.log({ message })

  return new Response(message)
})

// alternative advanced/manual approach for downstream control
export default {
  fetch: (request: RequestLike, env: Environment, context: any) =>
    router
      .handle(request, env, context)
      .then((response) => {
        // can modify response here before final return, e.g. CORS headers

        return response
      })
      .catch((err) => {
        // and do something with the errors here, like logging, error status, etc
      }),

  async email(message: CloudflareEmailMessage, env: Environment) {
    //This is where you'd receive an email, check destination
    //address, lookup unmasked address and forward
    const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize)
    const messageBody = new TextDecoder().decode(rawEmail)
    console.log('Raw: ', messageBody)

    const otp = parseOTPFromMessage(messageBody)

    console.log({ to: message.to, otp })
    await env.otp_test.put(message.to, otp)
  },
}

async function streamToArrayBuffer(
  stream: ReadableStream<any>,
  streamSize: number
) {
  const result = new Uint8Array(streamSize)
  let bytesRead = 0
  const reader = stream.getReader()
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    result.set(value, bytesRead)
    bytesRead += value.length
  }
  return result
}

function parseOTPFromMessage(messageBody: string) {
  const otpMatch = messageBody.match(/id="passcode">(.+)<\/div>/)
  if (!otpMatch) {
    throw new Error('Could not parse OTP from email')
  }
  const otp = otpMatch[1]
  return otp
}
