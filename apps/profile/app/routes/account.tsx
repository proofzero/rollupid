import { json, redirect } from '@remix-run/cloudflare'
import type { LoaderFunction, LinksFunction } from '@remix-run/cloudflare'
import { useLoaderData, NavLink, Link } from '@remix-run/react'

import { Outlet } from '@remix-run/react'

import { BiLink } from 'react-icons/bi'
import { AiOutlineUser } from 'react-icons/ai'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { RiCollageLine } from 'react-icons/ri'
import classNames from 'classnames'

import { parseJwt, requireJWT } from '~/utils/session.server'

import styles from '~/styles/account.css'

import type { AccountURN } from '@proofzero/urns/account'
import { AccountURNSpace } from '@proofzero/urns/account'
import HeadNav, { links as headNavLink } from '~/components/head-nav'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import {
  getAccountAddresses,
  getAccountProfile,
  getAddressProfiles,
} from '~/helpers/profile'
import type { Node, Profile } from '@proofzero/galaxy-client'
import type { AddressURN } from '@proofzero/urns/address'
import type { FullProfile } from '~/types'
import {
  toast,
  ToastType,
  Toaster,
} from '@proofzero/design-system/src/atoms/toast'

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
  const jwt = await requireJWT(request)

  // We go through this because
  // the context had connected addresses
  // but don't have the profiles
  // and it's complex to send them to a loader / action

  const accountURN = parseJwt(jwt).sub as AccountURN

  const [loggedInUserProfile, addresses] = await Promise.all([
    getAccountProfile({ jwt, accountURN }, context.traceSpan),
    getAccountAddresses({ jwt, traceSpan: context.traceSpan }),
  ])

  const addressTypeUrns = addresses.map((a) => ({
    urn: a.baseUrn,
    nodeType: a.rc.node_type,
  }))

  // We get the full profiles
  const connectedProfiles =
    (await getAddressProfiles(
      jwt,
      addressTypeUrns.map((atu) => atu.urn as AddressURN),
      context.traceSpan
    )) ?? []

  // This mapps to a new structure that contains urn also;
  // useful for list keys as well as for address context actions as param
  const normalizedConnectedProfiles = connectedProfiles.map((p, i) => ({
    ...addressTypeUrns[i],
    ...p,
  }))

  const cryptoAddresses =
    addresses?.filter((e) => {
      if (!e.rc) return false
      return e?.rc?.node_type === 'crypto'
    }) || []

  return json({
    connectedProfiles: normalizedConnectedProfiles,
    cryptoAddresses,
    accountURN,
    profile: loggedInUserProfile,
  })
}

const subNavigation = {
  publicProfiles: [
    {
      name: 'User Settings',
      href: '/account/profile',
      icon: AiOutlineUser,
      exists: true,
    },
    {
      name: 'Profile Links',
      href: '/account/links',
      icon: BiLink,
      exists: true,
    },
    {
      name: 'NFT Gallery',
      href: '/account/gallery',
      icon: RiCollageLine,
      exists: true,
    },
  ],
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
  const { profile, accountURN, connectedProfiles, cryptoAddresses } =
    useLoaderData<{
      profile: FullProfile
      accountURN: AccountURN
      connectedProfiles: Node & Profile[]
      cryptoAddresses: Node[]
    }>()

  return (
    <div className="bg-white h-full min-h-screen overflow-visible">
      <div
        className="header lg:px-4"
        style={{
          backgroundColor: '#192030',
        }}
      >
        <HeadNav
          loggedIn={!!profile}
          basePath={`/p/${AccountURNSpace.decode(accountURN)}`}
          avatarUrl={profile.pfp?.image as string}
          displayName={profile.displayName}
        />
      </div>
      <main className="-mt-72 pb-12">
        <div className="mx-auto max-w-screen-xl lg:px-4 md:px-4 pb-6 sm:px-6 lg:px-8 lg:pb-16">
          <div className="overflow-hidden bg-white shadow rounded-lg">
            <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
              <aside className="fixed bottom-0 z-50 w-full lg:relative lg:col-start-1 lg:col-end-3 bg-gray-50">
                <nav
                  className="flex flex-row justify-center items-center lg:flex-none 
                  hidden lg:block lg:mt-8 space-y-1"
                >
                  <Toaster position="top-right" reverseOrder={false} />
                  <div className="flex flex-row items-center mx-3 pb-6 truncate">
                    <img
                      src={profile.pfp?.image}
                      className="w-[42px] h-[42px] rounded-full mr-2"
                      alt="PFP"
                    />
                    <div className="flex-1 w-1 flex flex-col">
                      <Text
                        size="sm"
                        weight="medium"
                        className="truncate mb-1.5"
                      >
                        {profile.displayName}
                      </Text>
                      <Link
                        to={`/p/${AccountURNSpace.decode(accountURN)}`}
                        target="_blank"
                        className="flex flex-row items-center text-indigo-500"
                      >
                        <Text size="xs" className="truncate">
                          Open my Profile
                        </Text>
                        <HiOutlineExternalLink size={16} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                  {subNavigation.publicProfiles.map((item) => (
                    <SideNavItem key={item.name} item={item} />
                  ))}
                </nav>
              </aside>
              <div className="min-h-screen divide-y divide-transparent px-4 lg:col-start-3 lg:col-end-13 lg:p-4 lg:p-8">
                <Outlet
                  context={{
                    profile,
                    connectedProfiles,
                    cryptoAddresses,
                    accountURN,
                    notificationHandler: notify,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

type SideNavItemProps = {
  item: {
    name: string
    href: string
    icon: any
    exists?: boolean
  }
}

const SideNavItem = ({ item }: SideNavItemProps) => {
  const activeStyle = {
    backgroundColor: 'rgb(243 244 246)',
    borderColor: '#6366f1',
    fontWeight: 600,
    color: '#1f2937',
  }
  return (
    <div className={'basis-1/4 lg:w-100 content-center self-center z-50'}>
      <NavLink
        to={item.href}
        style={({ isActive }) => {
          return isActive && item.href != '#' ? activeStyle : undefined
        }}
        className="text-sm group lg:border-l-2 px-4 py-4
                     flex self-center justify-center items-center
                     flex-row lg:justify-start lg:items-start
                     hover:text-gray-500 hover:bg-gray-100"
      >
        <item.icon
          className={classNames(
            !item.exists && 'opacity-25 cursor-not-allowed',
            'text-sm flex-shrink-0 -ml-1 lg:mr-3 h-6 w-6 self-center'
          )}
          style={{
            color: '#4B5563',
          }}
          aria-hidden="true"
        />

        <span
          className={classNames(
            !item.exists && 'opacity-25 cursor-not-allowed',
            ' self-center'
          )}
        >
          <Text
            className="truncate self-center text-gray-600"
            size="sm"
            weight="medium"
          >
            {item.name}
          </Text>
        </span>
      </NavLink>{' '}
    </div>
  )
}
