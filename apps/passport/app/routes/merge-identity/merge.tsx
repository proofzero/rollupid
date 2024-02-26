import { redirect, type ActionFunction } from '@remix-run/cloudflare'

import { BadRequestError, ConflictError } from '@proofzero/errors'
import {
  getErrorCause,
  getRollupReqFunctionErrorWrapper,
} from '@proofzero/utils/errors'

import { getCoreClient } from '~/platform.server'

import {
  destroyIdentityMergeState,
  getAuthzCookieParams,
  getIdentityMergeState,
  getValidatedSessionContext,
} from '~/session.server'

import { getAuthzRedirectURL } from '~/utils/authenticate.server'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const mergeIdentityState = await getIdentityMergeState(request, context.env)
    if (!mergeIdentityState)
      throw new BadRequestError({
        message: 'missing merge identity state',
      })

    const { source, target } = mergeIdentityState

    const { jwt, identityURN } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )

    if (identityURN !== target) {
      destroyIdentityMergeState(request, context.env)
      throw new BadRequestError({
        message: 'invalid merge identity state',
      })
    }

    const coreClient = getCoreClient({
      context,
      jwt,
    })

    try {
      await coreClient.identity.merge.mutate({ source, target })
    } catch (e) {
      const error = getErrorCause(e)
      if (error instanceof ConflictError)
        return {
          error: {
            message: error.message,
          },
        }
      else throw error
    }

    const headers = new Headers()
    headers.append(
      'Set-Cookie',
      await destroyIdentityMergeState(request, context.env)
    )

    const params = await getAuthzCookieParams(request, context.env)
    return redirect(getAuthzRedirectURL(params), { headers })
  }
)
