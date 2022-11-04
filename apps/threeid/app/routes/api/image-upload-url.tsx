import { ActionFunction, json } from '@remix-run/cloudflare'
import { requireJWT } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request)

  const cfUploadUrlRes: {
    id: string
    uploadURL: string
    // @ts-ignore
  } = await ICONS.fetch('http://127.0.0.1/').then((res) => res.json())

  return json(cfUploadUrlRes.uploadURL)
}
