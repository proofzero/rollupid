import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction } from '@remix-run/cloudflare'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  () => new Response(null)
)
