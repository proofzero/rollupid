import type { AccountType, NodeType } from '@proofzero/types/account'
import { CryptoAccountType } from '@proofzero/types/account'
import { AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'
import { getAuthzCookieParams } from '~/session.server'

import { getCoreClient } from '../../../platform.server'
import { authenticateAccount } from '../../../utils/authenticate.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const searchParams = new URL(request.url).searchParams
    const { address } = params
    const node_type = searchParams.get('node_type') as NodeType
    const addr_type = searchParams.get('addr_type') as AccountType

    if (!address || !node_type || !addr_type) {
      throw json({ message: 'Invalid params' }, 400)
    }

    const accountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(CryptoAccountType.ETH, address),
      { node_type: node_type, addr_type: addr_type },
      { alias: address, hidden: 'false' }
    )

    const coreClient = getCoreClient({ context, accountURN })
    const identityURN = await coreClient.account.getIdentity.query()

    const appData = await getAuthzCookieParams(request, context.env)

    return authenticateAccount(
      accountURN,
      identityURN,
      appData,
      request,
      context.env,
      context.traceSpan
    )
  }
)
