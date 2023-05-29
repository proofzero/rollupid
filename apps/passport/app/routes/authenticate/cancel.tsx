import { InternalServerError } from '@proofzero/errors'
import { LoaderFunction, redirect } from '@remix-run/cloudflare'
import {
  destroyAuthzCookieParamsSession,
  getAuthzCookieParams,
} from '~/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const authzCookieParams = await getAuthzCookieParams(request, context.env)
    if (!authzCookieParams) {
      throw new InternalServerError({
        message: 'No authorization params cookie',
      })
    }

    if (
      !authzCookieParams.rollup_action ||
      !['connect', 'reconnect'].includes(authzCookieParams.rollup_action)
    ) {
      throw new InternalServerError({ message: 'Not a connect flow' })
    }

    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      await destroyAuthzCookieParamsSession(
        request,
        context.env,
        authzCookieParams.clientId
      )
    )

    headers.append(
      'Set-Cookie',
      await destroyAuthzCookieParamsSession(request, context.env)
    )

    const qp = new URLSearchParams()
    qp.append('state', authzCookieParams.state)
    qp.append('client_id', authzCookieParams.clientId)
    qp.append('redirect_uri', authzCookieParams.redirectUri)
    qp.append('scope', authzCookieParams.scope.join(' '))
    qp.append('rollup_result', 'CANCEL')

    if (authzCookieParams.prompt) qp.append('prompt', authzCookieParams.prompt)

    return redirect(`/authorize?${qp.toString()}`, { headers })
  }
)
