import { json } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'
import {
  getDefaultAuthzParams,
  getValidatedSessionContext,
} from '~/session.server'

import type { LoaderFunction } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const passportDefaultAuthzParams = getDefaultAuthzParams(request)

    const { jwt } = await getValidatedSessionContext(
      request,
      passportDefaultAuthzParams,
      context.env,
      context.traceSpan
    )
    const coreClient = getCoreClient({ context, jwt })
    const ownedApps = await coreClient.starbase.listApps.query()
    return json({ ownedApps })
  }
)
