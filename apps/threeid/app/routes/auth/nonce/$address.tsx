import { redirect } from '@remix-run/cloudflare'

import { oortSend } from '~/utils/rpc.server'
import { getUserSession } from '~/utils/session.server'
import { signMessageTemplate } from '~/utils/constants'

// Fetch the nonce for address
// TODO: support application/json response
// @ts-ignore
export const loader = async ({ request, params }) => {
  const session = await getUserSession(request)
  if (session.has('jwt')) {
    return redirect('/auth/gate/' + params.address)
  }

  const url = new URL(request.url)
  const isTest = url.searchParams.get('isTest')

  // @ts-ignore
  const nonceRes = await oortSend(
    'kb_getNonce',
    [
      params.address,
      signMessageTemplate,
      { '3id.profile': ['read', 'write'], '3id.app': ['read', 'write'] },
      // TODO: add support for { "blockchain": "ethereum", "chain": "goerli", "chainId": 5 } in JWT
    ],
    { address: params.address }
  )
  return redirect(
    `/auth/sign/${params.address}?nonce=${nonceRes.result.nonce}${
      isTest ? '&isTest=true' : ''
    }`
  )
}
