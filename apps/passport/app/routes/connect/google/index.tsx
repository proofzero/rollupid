import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { GoogleStrategyDefaultName } from 'remix-auth-google'
import type { GoogleStrategyOptions } from 'remix-auth-google'

import { RollupError } from '@proofzero/errors'

import { initAuthenticator, getGoogleAuthenticator } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const url = new URL(request.url)
  const prompt = url.searchParams.get('prompt')
  if (!isPromptValid(prompt))
    throw new RollupError({ message: 'invalid prompt' })
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getGoogleAuthenticator(context.env, prompt))
  return authenticator.authenticate(GoogleStrategyDefaultName, request)
}

const isPromptValid = (
  prompt: unknown
): prompt is GoogleStrategyOptions['prompt'] =>
  prompt == null ||
  prompt === 'consent' ||
  prompt === 'none' ||
  prompt === 'select_account'
