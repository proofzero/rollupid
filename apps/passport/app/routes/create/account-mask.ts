import { json } from '@remix-run/cloudflare'
import type { ActionFunction } from '@remix-run/cloudflare'

import { EmailAccountType, NodeType } from '@proofzero/types/account'
import { type AccountURN, AccountURNSpace } from '@proofzero/urns/account'
import { generateHashedIDRef } from '@proofzero/urns/idref'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getAccountDropdownItems } from '@proofzero/utils/getNormalisedConnectedAccounts'

import { getCoreClient } from '~/platform.server'
import { getValidatedSessionContext } from '~/session.server'
import { BadRequestError } from '@proofzero/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { jwt } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )

    const { accountURN, clientId } = await request.json<{
      accountURN: AccountURN
      clientId: string
    }>()

    if (typeof accountURN !== 'string')
      throw new BadRequestError({ message: 'missing account urn' })

    const coreClient = getCoreClient({ context, jwt, accountURN })
    const address = await coreClient.account.getMaskedAddress.query({
      clientId,
    })
    const qc = {
      alias: address,
      source: accountURN,
      clientId,
    }
    const rc = { node_type: NodeType.Email, addr_type: EmailAccountType.Mask }

    const maskAccountURN = AccountURNSpace.componentizedUrn(
      generateHashedIDRef(EmailAccountType.Mask, address),
      rc,
      qc
    )

    const maskAccountCoreClient = getCoreClient({
      context,
      jwt,
      accountURN: maskAccountURN,
    })

    await maskAccountCoreClient.account.setSourceAccount.mutate(accountURN)

    const profile =
      await maskAccountCoreClient.account.getAccountProfile.query()

    return json(getAccountDropdownItems([profile]))
  }
)
