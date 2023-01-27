// import { Profile, ProfileInput } from '@kubelt/galaxy-client'
// import { OAuthAddressType } from '@kubelt/types/address'
// import {
//   PlatformAddressURNHeader,
//   PlatformJWTAssertionHeader,
// } from '@kubelt/types/headers'
// import { AddressURN, AddressURNSpace } from '@kubelt/urns/address'
// import { generateHashedIDRef } from '@kubelt/urns/idref'
// import { LoaderFunction, redirect } from '@remix-run/cloudflare'
// import {
//   Links,
//   LiveReload,
//   Meta,
//   Outlet,
//   Scripts,
//   ScrollRestoration,
//   useCatch,
//   useLoaderData,
//   useOutletContext,
// } from '@remix-run/react'
// import { useParams } from 'react-router-dom'
// import { getGalaxyClient } from '~/helpers/clients'
// import { getRedirectUrlForProfile } from '~/utils/redirects.server'

import { Profile } from '@kubelt/galaxy-client'
import { AddressURN } from '@kubelt/urns/address'
import { Outlet, useLoaderData, useOutletContext } from '@remix-run/react'

// export const loader: LoaderFunction = async ({ request, params }) => {
//   const { address, type } = params
//   if (!address) throw new Error('No address provided with request')

//   const addressURN = AddressURNSpace.componentizedUrn(address)
//   const galaxyClient = await getGalaxyClient()
//   let profileAddress = undefined
//   try {
//     profileAddress = await (
//       await galaxyClient.getProfileFromAddress({ addressURN })
//     ).profileFromAddress
//   } catch (e) {
//     //profile doesn't exist for address, so we early return
//     console.log(`Could not find profile for address ${address}. Moving on.`)
//   }

//   if (profileAddress) {
//     if (type === 'a') {
//       let redirectUrl = getRedirectUrlForProfile(profileAddress)
//       const originalRoute = `/${type}/${address}`
//       //Redirect if we've found a better route
//       if (redirectUrl && originalRoute !== redirectUrl)
//         return redirect(redirectUrl)
//       //otherwise stay on current route
//     } else if (type === 'u') {
//       //TODO: galaxy search by handle
//       console.error('Not implemented')
//     } else {
//       //TODO: Type-based resolvers to be tackled in separate PR
//     }
//   }
//   return { profile: profileAddress, addressUrn: addressURN }
// }

// export default function Index() {
//   const { profile, addressUrn } = useLoaderData<{
//     profile: Profile
//     addressUrn: AddressURN
//   }>()

//   const { type, address } = useParams()

//   const outletContext = useOutletContext<{ loggedInUserProfile: Profile }>()

//   const { loggedInUserProfile } = outletContext
//   if (profile)
//     return <Outlet context={{ profile: loggedInUserProfile }}></Outlet>
//   else throw new Response(null, { status: 404 })
// }

// export function ErrorBoundary({ error }: any) {
//   console.debug('ERROR', error)
//   const caught = useCatch()
//   console.debug('CAUGHT', caught)
//   const { address, type } = useParams()

//   return (
//     <div>
//       <h3>404 page - Replace me with real, provider-specific components</h3>
//       <div>
//         This account is waiting to be unlocked. Do you own this account?
//       </div>
//       <div>
//         {type} / {address}
//       </div>
//     </div>
//   )
// }

export default function Index() {
  const outletContext = useOutletContext<{ loggedInUserProfile: Profile }>()

  const { loggedInUserProfile } = outletContext

  return <Outlet context={{ profile: loggedInUserProfile }}></Outlet>
}
