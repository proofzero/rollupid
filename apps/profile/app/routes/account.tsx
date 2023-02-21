import { json } from '@remix-run/cloudflare'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, NavLink, useOutletContext } from '@remix-run/react'

import { Outlet } from '@remix-run/react'

import { BiLink } from 'react-icons/bi'
import { AiOutlineUser } from 'react-icons/ai'
import { HiOutlineHome } from 'react-icons/hi'
import { TbPlugConnected, TbApps } from 'react-icons/tb'
import { RiCollageLine } from 'react-icons/ri'
import classNames from 'classnames'
import { Toaster, toast } from 'react-hot-toast'

import { requireJWT } from '~/utils/session.server'

import styles from '~/styles/account.css'

import { links as faqStyles } from '~/components/FAQ'

import ConditionalTooltip from '~/components/conditional-tooltip'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { getAccountAddresses, getAddressProfiles } from '~/helpers/profile'
import type { Node, Profile } from '@kubelt/galaxy-client'
import type { AddressURN } from '@kubelt/urns/address'

export function links() {
  return [...faqStyles(), { rel: 'stylesheet', href: styles }]
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  // We go through this because
  // the context had connected addresses
  // but don't have the profiles
  // and it's complex to send them to a loader / action
  const addresses = (await getAccountAddresses(jwt)) ?? []
  const addressTypeUrns = addresses.map((a) => ({
    urn: a.baseUrn,
    nodeType: a.rc.node_type,
  }))

  // We get the full profiles
  const profiles =
    (await getAddressProfiles(
      jwt,
      addressTypeUrns.map((atu) => atu.urn as AddressURN)
    )) ?? []

  // This mapps to a new structure that contains urn also;
  // useful for list keys as well as for address context actions as param
  const addressProfiles = profiles.map((p, i) => ({
    ...addressTypeUrns[i],
    ...p,
  }))

  const cryptoAddresses =
    addresses?.filter((e) => {
      if (!e.rc) return false
      return e?.rc?.node_type === 'crypto'
    }) || []

  return json({
    addresses,
    addressProfiles,
    cryptoAddresses,
  })
}

const subNavigation = {
  general: [
    {
      name: 'Home',
      href: '/account/dashboard',
      icon: HiOutlineHome,
      exists: true,
    },
  ],
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
  connections: [
    {
      name: 'Accounts',
      href: '/account/connections',
      icon: TbPlugConnected,
      exists: true,
    },
    { name: 'Applications', href: '#', icon: TbApps },
  ],
}

const notify = (success: boolean = true) => {
  if (success) {
    toast.success('Saved')
  } else {
    toast.error('Save Failed -- Please try again')
  }
}

export default function AccountLayout() {
  const { addresses, addressProfiles, cryptoAddresses } = useLoaderData<{
    addresses: Node[]
    addressProfiles: any[]
    cryptoAddresses: Node[]
  }>()
  const { profile, accountURN } = useOutletContext<{
    profile: Profile
    accountURN: string
  }>()

  return (
    <main className="-mt-72 pb-12">
      <div className="mx-auto max-w-screen-xl lg:px-4 md:px-4 pb-6 sm:px-6 lg:px-8 lg:pb-16">
        <div className="overflow-hidden bg-white shadow rounded-lg">
          <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
            <aside className="fixed bottom-0 z-50 w-full lg:relative lg:col-start-1 lg:col-end-3 bg-gray-50">
              <nav className="flex flex-row justify-center items-center lg:flex-none lg:block lg:mt-8 space-y-1">
                <Toaster position="top-right" reverseOrder={false} />
                {subNavigation.general.map((item) => (
                  <SideNavItem key={item.name} item={item} />
                ))}
                <Text
                  size="sm"
                  className="ml-5 pt-5 text-gray-500
                hidden lg:block"
                >
                  Public Profiles
                </Text>
                {subNavigation.publicProfiles.map((item) => (
                  <SideNavItem key={item.name} item={item} />
                ))}
                <Text
                  size="sm"
                  className="ml-5 pt-5 text-gray-500 
                hidden lg:block"
                >
                  Connections
                </Text>
                {subNavigation.connections.map((item) => (
                  <SideNavItem key={item.name} item={item} />
                ))}
              </nav>
            </aside>
            <div className="min-h-screen divide-y divide-transparent px-4 lg:col-start-3 lg:col-end-13 lg:p-4 lg:p-8">
              <Outlet
                context={{
                  profile,
                  addresses,
                  addressProfiles,
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
      <ConditionalTooltip
        content="Coming Soon"
        condition={!item.exists}
        placement={'top-start'}
      >
        <NavLink
          to={item.href}
          // @ts-ignore
          style={({ isActive }) => {
            return isActive && item.href != '#' ? activeStyle : undefined
          }}
          className="text-sm group lg:border-l-2 px-4 py-4 flex self-center justify-center items-center flex-row lg:justify-start lg:items-start hover:text-gray-500 hover:bg-gray-100"
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
              'hidden lg:block self-center'
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
      </ConditionalTooltip>
    </div>
  )
}
