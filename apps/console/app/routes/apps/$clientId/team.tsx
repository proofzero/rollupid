import { Text } from '@proofzero/design-system'
import { HiOutlineMail } from 'react-icons/hi'
import { AuthButton } from '@proofzero/design-system/src/molecules/auth-button/AuthButton'
import { useSubmit } from '@remix-run/react'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'

export const action: ActionFunction = async ({ request }) => {
  const currentURL = new URL(request.url)
  currentURL.search = ''

  const qp = new URLSearchParams()
  qp.append('scope', '')
  qp.append('state', 'skip')
  qp.append('client_id', 'console')

  qp.append('redirect_uri', currentURL.toString())
  qp.append('prompt', 'connect')
  qp.append('login_hint', 'email microsoft google apple')

  return redirect(`${PASSPORT_URL}/authorize?${qp.toString()}`)
}

export default () => {
  useConnectResult(['SUCCESS', 'ALREADY_CONNECTED', 'CANCEL'])

  const submit = useSubmit()

  return (
    <>
      <div className="flex flex-row items-center space-x-3 pb-5">
        <Text
          size="2xl"
          weight="semibold"
          className="text-gray-900 ml-2 lg:ml-0 "
        >
          Team & Contact
        </Text>

        <DocumentationBadge url="https://docs.rollup.id/platform/console/teams-and-contact" />
      </div>

      <div className="bg-white p-10 rounded-lg shadow flex flex-col">
        <Text size="lg" weight="semibold" className="text-gray-900 mb-4">
          Contact Email
        </Text>

        <div className="self-start mb-8">
          <AuthButton
            onClick={() => submit({}, { method: 'post' })}
            Graphic={<HiOutlineMail className="w-full h-full" />}
            text={'Connect Email Address'}
          />
        </div>

        <Text size="sm" weight="normal" className="text-gray-500">
          This will be used for notifications about your application
        </Text>
      </div>
    </>
  )
}
