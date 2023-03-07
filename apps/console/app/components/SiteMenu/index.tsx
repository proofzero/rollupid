/**
 * @file app/shared/components/SiteMenu/index.tsx
 */

import * as React from 'react'

import { Link, NavLink } from '@remix-run/react'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import AppSelect from './appSelect'

// Images
import consoleLogo from '~/images/console_logo.svg'
import {
  HiOutlineChartSquareBar,
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlineDocument,
  HiOutlineHome,
} from 'react-icons/hi'
import {
  TbScan,
  TbMessage,
  TbCrosshair,
  TbReceipt2,
  TbUsers,
  TbWorld,
} from 'react-icons/tb'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { IconType } from 'react-icons'

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
}

const menuItemClass = (isActive: boolean, disabled: boolean = false) =>
  `flex flex-row space-x-3 items-center p-2 rounded-md hover:bg-gray-800 hover:text-white ${
    isActive ? 'bg-gray-800 text-white' : 'text-gray-400'
  } ${disabled ? 'hover:cursor-not-allowed' : ''}`

export default function SiteMenu(props: RollupMenuProps) {
  return (
    <div className="text-center bg-gray-900 pb-4 md:min-h-screen md:min-w-[256px] md:max-w-sm md:border-r md:text-left">
      <div className="object-left">
        <RollupLogo />
      </div>
      {/* Mobile menu */}
      <div className="md:hidden ">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="absolute right-0 top-0 my-5 items-right justify-right bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Disclosure.Button>
              <Disclosure.Panel>
                <AppMenu props={props} />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>

      {/* Desktop menu */}
      <div className="hidden md:block">
        <AppMenu props={props} />
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
        disabled: true,
      },
      {
        title: 'Designer',
        icon: HiOutlineColorSwatch,
        subroute: '/designer',
      },
      {
        title: 'Custom Domain',
        icon: TbWorld,
        disabled: true,
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
        disabled: true,
      },
      {
        title: 'Messaging',
        icon: TbMessage,
        disabled: true,
      },
      {
        title: 'Audience Builder',
        icon: TbCrosshair,
        disabled: true,
      },
    ],
  },
  {
    title: 'Management',
    links: [
      {
        title: 'Team & Contact',
        icon: TbUsers,
        disabled: true,
      },
      {
        title: 'Billing',
        icon: TbReceipt2,
        disabled: true,
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
            <al.icon className="w-6 h-6" />
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
