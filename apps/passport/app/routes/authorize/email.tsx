import { EmailConnection } from '@proofzero/design-system/src/molecules/email-connection-modal/EmailConnection'
import { OAuthAddressType } from '@proofzero/types/address'
import { EmailAddressType } from '@proofzero/types/address'
import { LoaderFunction, json } from '@remix-run/cloudflare'
import { useLoaderData, useNavigate, useSubmit } from '@remix-run/react'
import { getConsoleParams, setConsoleParamsSession } from '~/session.server'

export const loader: LoaderFunction = async ({ request, context }) => {
  const lastCP = await getConsoleParams(request, context.env)

  const { clientId } = lastCP
  if (!clientId) throw new Error('No client id provided')

  const headers = new Headers()
  headers.append(
    'Set-Cookie',
    await setConsoleParamsSession(
      { ...lastCP, prompt: 'connect' },
      context.env,
      clientId
    )
  )
  headers.append(
    'Set-Cookie',
    await setConsoleParamsSession({ ...lastCP, prompt: 'connect' }, context.env)
  )

  return json(
    {
      clientId,
    },
    {
      headers,
    }
  )
}

export default () => {
  const { clientId } = useLoaderData()

  const submit = useSubmit()
  const navigate = useNavigate()

  return (
    <EmailConnection
      providers={[
        {
          callback: () => navigate(`/authenticate/${clientId}/email`),
          addr_type: EmailAddressType.Email,
        },
        {
          callback: () => {
            submit(
              {},
              {
                action: 'connect/microsoft',
                method: 'post',
              }
            )
          },
          addr_type: OAuthAddressType.Microsoft,
        },
      ]}
      cancelCallback={function (): void {
        throw new Error('Function not implemented.')
      }}
    />
  )
}
