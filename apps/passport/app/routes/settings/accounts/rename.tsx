import type { ActionFunction } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const accountURN = formData.get('id') as string
    const coreClient = getCoreClient({ context, accountURN })

    await coreClient.account.setNickname.query({
      nickname: name,
    })

    return null
  }
)
