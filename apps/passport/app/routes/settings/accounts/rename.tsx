import type { ActionFunction } from '@remix-run/cloudflare'
import { getAddressClient } from '~/platform.server'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()

  const id = formData.get('id') as string
  const name = formData.get('name') as string

  const addressClient = getAddressClient(id, context.env, context.traceSpan)

  try {
    await addressClient.setNickname.query({
      nickname: name,
    })
  } catch (ex) {
    console.error(ex)
  }

  return null
}
