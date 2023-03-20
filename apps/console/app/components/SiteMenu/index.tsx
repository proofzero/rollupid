/**
 * @file app/shared/components/SiteMenu/index.tsx
 */

import * as React from 'react'

import { Link, NavLink } from '@remix-run/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import AppSelect from './appSelect'

// Images
import consoleLogo from '~/images/console_logo.svg'
import {
  HiOutlineChartSquareBar,
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlineDocument,
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineExternalLink,
} from 'react-icons/hi'
import {
  TbScan,
  TbMessage,
  TbCrosshair,
  TbReceipt2,
  TbUsers,
  TbWorld,
} from 'react-icons/tb'
import { BsGear } from 'react-icons/bs'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import type { IconType } from 'react-icons'

// RollupLogo
// -----------------------------------------------------------------------------
const RollupLogo = () => {
  return (
    <Link to="/">
      <img
        className="mx-4 my-5 max-w-[180px]"
        src={consoleLogo}
        alt="console logo"
      />
    </Link>
  )
}

// RollupMenu
// -----------------------------------------------------------------------------

type RollupMenuProps = {
  // An array of application objects.
  apps: {
    clientId: string
    name?: string
    icon?: string
  }[]
  // Current selected Client ID.
  selected?: string
  PASSPORT_URL: string
}

const menuItemClass = (isActive: boolean, disabled: boolean = false) =>
  `flex flex-row space-x-3 items-center p-2 rounded-md hover:bg-gray-800 hover:text-white ${
    isActive ? 'bg-gray-800 text-white' : 'text-gray-400'
  } ${disabled ? 'hover:cursor-not-allowed' : ''}`

export default function SiteMenu(props: RollupMenuProps) {
  return (
    <div
      className="text-center bg-gray-900 pb-4 md:min-h-screen 
    md:min-w-[256px] md:max-w-sm md:border-r md:text-left
    flex flex-col"
    >
      <div className="object-left">
        <RollupLogo />
      </div>
      {/* Mobile menu */}
      <div className="md:hidden ">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                className="absolute right-0 top-0 my-5 items-right
              justify-right bg-gray-800 p-2 text-gray-400 hover:bg-gray-700
              hover:text-white focus:outline-none focus:ring-2 focus:ring-white
              focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
              <Disclosure.Panel>
                <AppMenu props={props} />
                <ExternalLinks
                  PASSPORT_URL={props.PASSPORT_URL}
                  docsURL={'https://docs.rollup.id'}
                />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:block">
        <AppMenu props={props} />
      </div>
      <div className="hidden md:block mt-auto">
        <ExternalLinks
          PASSPORT_URL={props.PASSPORT_URL}
          docsURL={'https://docs.rollup.id'}
        />
      </div>
    </div>
  )
}

type AppMenuProps = {
  props: RollupMenuProps
}

const appSubmenuStruct: {
  title: string
  links: {
    icon: IconType
    title: string
    subroute?: string
    disabled?: boolean
  }[]
}[] = [
  {
    title: '',
    links: [
      {
        title: 'Dashboard',
        icon: HiOutlineHome,
        subroute: '',
      },
    ],
  },
  {
    title: 'Configuration',
    links: [
      {
        title: 'OAuth',
        icon: HiOutlineCog,
        subroute: '/auth',
      },
      {
        title: 'Blockchain',
        icon: HiOutlineDocument,
        subroute: '/blockchain',
      },
      {
        title: 'Designer',
        icon: HiOutlineColorSwatch,
        subroute: '/designer',
      },
      {
        title: 'Custom Domain',
        icon: TbWorld,
        subroute: '/domain',
      },
    ],
  },
  {
    title: 'CRM',
    links: [
      {
        title: 'Users',
        icon: HiOutlineChartSquareBar,
        subroute: '/users',
      },
      {
        title: 'KYC',
        icon: TbScan,
        subroute: '/kyc',
      },
      {
        title: 'Messaging',
        icon: TbMessage,
        subroute: '/messaging',
      },
      {
        title: 'Audience Builder',
        icon: TbCrosshair,
        subroute: '/audience',
      },
    ],
  },
  {
    title: 'Management',
    links: [
      {
        title: 'Team & Contact',
        icon: TbUsers,
        subroute: '/team',
      },
      {
        title: 'Billing',
        icon: TbReceipt2,
        subroute: '/billing',
      },
    ],
  },
]

const AppSubmenu = (appSubroute: string) =>
  appSubmenuStruct.map((ass) => (
    <div key={ass.title} className="mt-6">
      <Text size="xs" weight="medium" className="uppercase text-gray-500">
        {ass.title}
      </Text>

      <section>
        {ass.links.map((al, i) => (
          <NavLink
            key={i}
            to={`/apps/${appSubroute}${
              al.disabled || al.subroute == undefined ? '/soon' : al.subroute
            }`}
            onClick={al.disabled ? (e) => e.preventDefault() : undefined}
            className={({ isActive }) => menuItemClass(isActive, al.disabled)}
            end
          >
            <al.icon size={24} />
            <Text size="sm" weight="medium">
              {al.title}
            </Text>
          </NavLink>
        ))}
      </section>
    </div>
  ))

function AppMenu({ props }: AppMenuProps) {
  return (
    <div>
      <AppSelect apps={props.apps} selected={props.selected} />

      {props.selected && (
        <section className="px-2 md:flex md:flex-col">
          {AppSubmenu(props.selected)}
        </section>
      )}
    </div>
  )
}

type ExternalLinksProps = {
  PASSPORT_URL: string
  docsURL: string
}

function ExternalLinks({ PASSPORT_URL, docsURL }: ExternalLinksProps) {
  return (
    <div className="mt-2 border-t border-gray-700">
      <div className="px-2 pt-2">
        <NavLink
          to={PASSPORT_URL}
          target="_blank"
          className={({ isActive }) => `${menuItemClass(isActive, false)} `}
        >
          <BsGear size={24} className="mr-2" />
          <div className="flex flex-row w-full items-center justify-between">
            <Text size="sm" weight="medium">
              User Settings
            </Text>
            <HiOutlineExternalLink size={22} className="right-0" />
          </div>
        </NavLink>
      </div>

      <div className="px-2">
        <NavLink
          to={docsURL}
          target="_blank"
          className={({ isActive }) => menuItemClass(isActive, false)}
        >
          <HiOutlineBookOpen size={24} className="mr-2" />
          <div className="flex flex-row w-full items-center justify-between">
            <Text size="sm" weight="medium">
              Documentation
            </Text>
            <HiOutlineExternalLink size={22} className="right-0" />
          </div>
        </NavLink>
      </div>
    </div>
  )
}
