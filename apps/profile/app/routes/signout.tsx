import { ActionFunction, redirect } from '@remix-run/cloudflare'
import {
  getProfileSession,
  destroyProfileSession,
} from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const session = await getProfileSession(request)
  return await destroyProfileSession(session)
}
