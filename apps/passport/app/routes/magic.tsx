import { LoaderFunction, json } from '@remix-run/cloudflare'
import { Form, useLoaderData } from '@remix-run/react'

export const loader: LoaderFunction = async ({ request, params }) => {
  const qp = new URL(request.url).searchParams
  const email = qp.get('email')
  const code = qp.get('code')
  const state = qp.get('state')
  const clientId = qp.get('clientId')

  return json({
    email,
    code,
    state,
    clientId,
  })
}

export default () => {
  const { email, code, state, clientId } = useLoaderData<{
    email: string
    code: string
    state: string
    clientId: string
  }>()

  return (
    <Form
      action={`/authenticate/${clientId}/email/verify?email=${email}&state=${state}`}
      method="post"
    >
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="state" value={state} />
      <input type="hidden" name="code" value={code} />

      <button type="submit">Verify</button>
    </Form>
  )
}
