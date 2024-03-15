import { redirect, type LoaderFunction } from '@remix-run/cloudflare'

import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

import { destroyIdentityMergeState } from '~/session.server'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      await destroyIdentityMergeState(request, context.env)
    )
    return redirect('/authenticate/cancel', { headers })
  }
)
