import type { LoaderFunction } from '@remix-run/cloudflare'

import { BadRequestError } from '@proofzero/errors'
import { JsonError } from '@proofzero/utils/errors'
import { AccountURNSpace } from '@proofzero/urns/account'

import { getCoreClient } from '~/platform.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    if (!params['address'])
      throw new BadRequestError({ message: 'address is missing' })

    const accountURN = AccountURNSpace.urn(params['address'])
    const coreClient = getCoreClient({ context, accountURN })
    const data = atob(await coreClient.account.getAccountAvatar.query())
    const buffer = new ArrayBuffer(data.length)
    const bufferView = new Uint8Array(buffer)
    for (var i = 0; i < data.length; i++) {
      bufferView[i] = data.charCodeAt(i)
    }

    return new Response(buffer, {
      headers: {
        'cache-control': `max-age=${6 * 60 * 60}`,
      },
    })
  }
)
