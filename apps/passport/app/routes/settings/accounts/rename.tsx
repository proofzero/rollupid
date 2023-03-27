// import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
// import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
// import type { ActionFunction } from '@remix-run/cloudflare'
// import { getGalaxyClient } from '~/helpers/clients'
// import { requireJWT } from '~/utils/session.server'

// export const action: ActionFunction = async ({ request, context }) => {
//   const jwt = await requireJWT(request)

//   const formData = await request.formData()

//   const id = formData.get('id') as string
//   const name = formData.get('name') as string

//   const galaxyClient = await getGalaxyClient({
//     ...generateTraceContextHeaders(context.traceSpan),
//   })
//   await galaxyClient.updateAddressNickname(
//     {
//       addressURN: id,
//       nickname: name,
//     },
//     getAuthzHeaderConditionallyFromToken(jwt)
//   )

//   return null
// }
