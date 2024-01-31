import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, LinksFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'

import { Outlet } from '@remix-run/react'

import { InternalServerError } from '@proofzero/errors'
import { JsonError } from '@proofzero/utils/errors'

import { parseJwt, requireJWT } from '~/utils/session.server'

import styles from '~/styles/account.css'

import type { IdentityURN } from '@proofzero/urns/identity'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import HeadNav, { links as headNavLink } from '~/components/head-nav'
import { DesktopSideNav } from '~/components/side-nav'

import {
  getIdentityAccounts,
  getIdentityProfile,
  getAccountProfiles,
} from '~/helpers/profile'
import type {
  GetAccountProfilesQuery,
  Node,
  Profile,
} from '@proofzero/galaxy-client'
import type { AccountURN } from '@proofzero/urns/account'
import type { FullProfile } from '~/types'
import {
  toast,
  ToastType,
  Toaster,
} from '@proofzero/design-system/src/atoms/toast'

import { Popover } from '@headlessui/react'

export const links: LinksFunction = () => {
  return [...headNavLink(), { rel: 'stylesheet', href: styles }]
}

export const loader: LoaderFunction = async ({ request, context }) => {
  /**
   * If we don't redirect here
   * we will load loader -> then go to /$type/$address/index
   * -> then will redirect to /links and call this same
   * loader second time
   */
  const url = new URL(request.url)
  if (url.pathname === '/account') {
    return redirect('/account/dashboard')
  }
  const jwt = await requireJWT(request, context.env)

  // We go through this because
  // the context had connected addresses
  // but don't have the profiles
  // and it's complex to send them to a loader / action

  const identityURN = parseJwt(jwt).sub as IdentityURN

  try {
    const [loggedInUserProfile, accounts] = await Promise.all([
      getIdentityProfile({ jwt, identityURN }, context.env, context.traceSpan),
      getIdentityAccounts({ jwt }, context.env, context.traceSpan),
    ])

    const accountTypeUrns = accounts.map((a) => ({
      urn: a.baseUrn,
      nodeType: a.rc.node_type,
    }))

    let connectedProfiles: GetAccountProfilesQuery['accountProfiles'] = []

    // We get the full profiles
    connectedProfiles =
      (await getAccountProfiles(
        jwt,
        accountTypeUrns.map((atu) => atu.urn as AccountURN),
        context.env,
        context.traceSpan
      )) ?? []

    // This mapps to a new structure that contains urn also;
    // useful for list keys as well as for account context actions as param
    const normalizedConnectedProfiles = connectedProfiles.map((p, i) => ({
      ...accountTypeUrns[i],
      ...p,
    }))

    const cryptoAccounts =
      accounts?.filter((e) => {
        if (!e.rc) return false
        return e?.rc?.node_type === 'crypto'
      }) || []

    return json({
      connectedProfiles: normalizedConnectedProfiles,
      cryptoAccounts,
      identityURN,
      profile: loggedInUserProfile,
    })
  } catch (error) {
    throw JsonError(
      new InternalServerError({
        message: 'failed to load profiles',
        cause: error,
      }),
      context.traceSpan.getTraceParent()
    )
  }
}

const notify = (success: boolean = true) => {
  if (success) {
    toast(ToastType.Success, { message: 'Saved' }, { duration: 2000 })
  } else {
    toast(
      ToastType.Error,
      { message: 'Save Failed -- Please try again' },
      { duration: 2000 }
    )
  }
}

export default function AccountLayout() {
  const { profile, identityURN, connectedProfiles, cryptoAccounts } =
    useLoaderData<{
      profile: FullProfile
      identityURN: IdentityURN
      connectedProfiles: Node & Profile[]
      cryptoAccounts: Node[]
    }>()

  return (
    <Popover className="bg-white h-full min-h-[100dvh] overflow-visible">
      {({ open }) => {
        return (
          <>
            <div
              className={`lg:px-4 transition-colors lg:pb-72 lg:bg-[#192030] ${
                open ? 'max-sm:bg-[#192030]' : 'bg-[#192030] sm:max-lg:pb-72'
              }`}
            >
              <HeadNav
                loggedIn={!!profile}
                identityURN={IdentityURNSpace.decode(identityURN)}
                avatarUrl={profile.pfp?.image as string}
                displayName={profile.displayName}
                open={open}
              />
            </div>

            <main
              className={`transition-opacity transition-colors ${
                open
                  ? 'max-lg:bg-[#192030] max-lg:opacity-50  \
                  h-[calc(100dvh-80px)] min-h-[568px] \
                  sm:max-lg:pt-72 sm:max-lg:h-[calc(100dvh+208px)] sm:max-lg:min-h-[856px]\
                  overflow-hidden'
                  : 'opacity-100'
              } sm:-mt-72  lg:pb-12`}
            >
              <div
                className="mx-auto max-w-screen-xl lg:px-4
              md:px-4 md:pb-6 sm:px-6 lg:px-8 lg:pb-16"
              >
                <div className={`bg-white  shadow sm:rounded-lg`}>
                  <div
                    className="divide-y divide-gray-200
                  lg:grid
                  lg:max-[1200px]:grid-cols-10 min-[1200px]:grid-cols-12
                  lg:divide-y-0 lg:divide-x"
                  >
                    <Toaster position="top-right" reverseOrder={false} />
                    <DesktopSideNav
                      profile={profile}
                      identityURN={IdentityURNSpace.decode(identityURN)}
                    />
                    <div
                      className="min-h-[100dvh] divide-y divide-transparent px-4
                    lg:col-start-3
                    lg:max-[1200px]:col-end-11 min-[1200px]:col-end-13
                    lg:p-4 lg:p-8"
                    >
                      <Outlet
                        context={{
                          profile,
                          connectedProfiles,
                          cryptoAccounts,
                          identityURN,
                          notify,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </>
        )
      }}
    </Popover>
  )
}
