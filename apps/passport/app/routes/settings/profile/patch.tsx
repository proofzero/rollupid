import { json, type ActionFunction } from '@remix-run/cloudflare'
import { getCoreClient } from '~/platform.server'
import { getValidatedSessionContext } from '~/session.server'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const { jwt } = await getValidatedSessionContext(
      request,
      context.authzQueryParams,
      context.env,
      context.traceSpan
    )

    const formData = await request.formData()
    const name = formData.get('name') as string | undefined
    const picture = formData.get('picture') as string | undefined

    try {
      const coreClient = getCoreClient({ context, jwt })
      await coreClient.identity.patchProfileFields.mutate({
        displayName: name,
        pictureURL: picture,
      })
    } catch (ex) {
      return json({
        error: true,
        message: 'Profile update unsuccessful',
      })
    }

    return json({
      error: false,
      message: 'Profile updated successfully',
    })
  }
)
