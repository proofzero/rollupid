import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { authenticator } from '~/auth.server'

export const action: ActionFunction = ({ request }: ActionArgs) => {
  return authenticator.authenticate('google', request)
}
