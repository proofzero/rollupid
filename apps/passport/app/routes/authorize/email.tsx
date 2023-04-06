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
    <div
      className={'flex flex-col gap-4 basis-96 m-auto bg-white p-6'}
      style={{
        width: 418,
        height: 598,
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
        borderRadius: 8,
      }}
    >
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
          {
            callback: () => {
              submit(
                {},
                {
                  action: 'connect/google',
                  method: 'post',
                }
              )
            },
            addr_type: OAuthAddressType.Google,
          },
        ]}
        cancelCallback={function (): void {
          throw new Error('Function not implemented.')
        }}
      />
    </div>
  )
}
