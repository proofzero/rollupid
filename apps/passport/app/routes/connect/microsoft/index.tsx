import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'

import { MicrosoftStrategyDefaultName } from 'remix-auth-microsoft'
import type { MicrosoftStrategyOptions } from 'remix-auth-microsoft'

import { RollupError } from '@proofzero/errors'

import { initAuthenticator, getMicrosoftStrategy } from '~/auth.server'

export const action: ActionFunction = async ({
  request,
  context,
}: ActionArgs) => {
  const url = new URL(request.url)
  const prompt = url.searchParams.get('prompt')
  if (!isPromptValid(prompt))
    throw new RollupError({ message: 'invalid prompt' })
  const authenticator = initAuthenticator(context.env)
  authenticator.use(getMicrosoftStrategy(context.env, prompt))
  return authenticator.authenticate(MicrosoftStrategyDefaultName, request)
}

const isPromptValid = (
  prompt: unknown
): prompt is MicrosoftStrategyOptions['prompt'] =>
  prompt == null || typeof prompt === 'string'
