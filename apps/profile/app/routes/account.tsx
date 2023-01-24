import { json, LoaderFunction } from '@remix-run/cloudflare'
import { useLoaderData, NavLink } from '@remix-run/react'

import { Outlet } from '@remix-run/react'

import { BiCog, BiIdCard, BiLink } from 'react-icons/bi'
import { HiOutlineHome, HiOutlineViewGridAdd } from 'react-icons/hi'
import classNames from 'classnames'

import { requireJWT } from '~/utils/session.server'

import styles from '~/styles/account.css'

import { links as faqStyles } from '~/components/FAQ'

import ConditionalTooltip from '~/components/conditional-tooltip'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { getAccountAddresses, getAccountProfile } from '~/helpers/profile'
import type { Node, Profile } from '@kubelt/galaxy-client'

export function links() {
  return [...faqStyles(), { rel: 'stylesheet', href: styles }]
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const [profile, addresses] = await Promise.all([
    getAccountProfile(jwt),
    getAccountAddresses(jwt),
  ])

  const cryptoAddresses =
    addresses?.filter((e) => {
      if (!e.rc) return false
      return e?.rc?.node_type === 'crypto'
    }) || []

  return json({
    profile,
    addresses,
    cryptoAddresses,
  })
}

const subNavigation = [
  {
    name: 'Dashboard',
    href: '/account/dashboard',
    icon: HiOutlineHome,
    exists: true,
  },
  {
    name: 'NFT Gallery',
    href: '/account/gallery',
    icon: HiOutlineViewGridAdd,
    exists: true,
  },
  { name: 'KYC', href: '#', icon: BiIdCard },
  { name: 'Apps', href: '#', icon: BiLink },
  { name: 'Settings', href: 'settings', icon: BiCog, exists: true },
]

export default function AccountLayout() {
  const { profile, addresses, cryptoAddresses } = useLoaderData<{
    profile: Profile
    addresses: Node[]
    cryptoAddresses: Node[]
  }>()
  return (
    <main className="-mt-72 pb-12">
      <div className="mx-auto max-w-screen-xl lg:px-4 md:px-4 pb-6 sm:px-6 lg:px-8 lg:pb-16">
        <div className="overflow-hidden bg-white shadow rounded-lg">
          <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
            <aside className="fixed bottom-0 z-50 w-full lg:relative lg:col-start-1 lg:col-end-3 bg-gray-50">
              <nav className="flex flex-row justify-center items-center lg:flex-none lg:block lg:mt-8 space-y-1">
                {subNavigation.map((item) => (
                  <SideNavItem key={item.name} item={item} />
                ))}
              </nav>
            </aside>
            <div className="divide-y divide-gray-200 px-4 sm:mb-16 lg:col-start-3 lg:col-end-13 lg:p-4 lg:p-8">
              <Outlet
                context={{
                  profile,
                  addresses,
                  cryptoAddresses,
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
