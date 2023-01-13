import { ActionArgs, ActionFunction, redirect } from '@remix-run/cloudflare'
import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import { authenticator } from '~/auth.server'

export async function loader() {
  return redirect('/authenticate')
}

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const result = await authenticator.authenticate(
    MicrosoftStrategyDefaultName,
    request
  )
  return result
}
