/**
 * @file app/components/SideMenu/index.tsx
 */

import React, { useState, Fragment } from 'react'
import { usePopper } from 'react-popper'

import { Link } from '@remix-run/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

// Images
import passportLogo from '../../assets/PassportLogoBlack.svg'
import consoleLogo from '../../assets/consoleLogo.svg'
import {
  HiOutlineHome,
  HiOutlineBookOpen,
  HiOutlineExternalLink,
} from 'react-icons/hi'
import { TbPlugConnected, TbApps } from 'react-icons/tb'
import { BsGear } from 'react-icons/bs'

import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { SideMenuItem } from './Item'

// Passport Logo
// -----------------------------------------------------------------------------
const PassportLogo = () => {
  return (
    <Link to="/">
      <img
        className="mx-4 h-[80px] max-w-[180px]"
        src={passportLogo}
        alt="passport logo"
      />
    </Link>
  )
}

const ConsoleLogo = () => {
  return <img src={consoleLogo} className="-ml-3 mr-3" alt="console logo" />
}

// RollupMenu
// -----------------------------------------------------------------------------

type PassportMenuProps = {
  open: boolean
  CONSOLE_URL: string
}

export default function SideMenu({ open, CONSOLE_URL }: PassportMenuProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { attributes } = usePopper(referenceElement, popperElement)

  return (
    <div
      className="text-center bg-white lg:pb-4 lg:min-h-screen
    lg:min-w-[256px] lg:max-w-sm lg:border-r lg:text-left
    flex flex-col"
    >
      {/* Desktop Menu */}
      <div className="hidden lg:block h-full ">
        <div className="object-left">
          <PassportLogo />
        </div>
        <AppSubmenu />
      </div>
      <div className="mt-auto hidden lg:block">
        <SideMenuItem
          item={{
            name: 'Developer Console',
            icon: ConsoleLogo,
            href: CONSOLE_URL,
            exists: true,
          }}
        />
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Popover.Button
          className="absolute right-0 top-0 my-5 items-right mr-12
              justify-right bg-white border p-2 text-black hover:bg-gray-50
               focus:outline-none focus:ring-2 focus:ring-white
              focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <span className="sr-only">Open main menu</span>
          {open ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </Popover.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel
          className={`
          bg-white border mt-[80px] lg:hidden z-[100] min-h-[calc(100%-80px)] w-[240px]
          flex flex-col`}
          ref={setPopperElement}
          style={{ position: 'absolute', right: '0', top: '0' }}
          {...attributes.popper}
        >
          <MobileAppSubmenu ref={setReferenceElement} />
          <div className="mt-auto block lg:hidden">
            <SideMenuItem
              item={{
                name: 'Developer Console',
                icon: ConsoleLogo,
                href: CONSOLE_URL,
                exists: true,
              }}
            />
          </div>
        </Popover.Panel>
      </Transition>
    </div>
  )
}

const navigation = {
  general: [
    {
      name: 'Dashboard',
      href: '/settings/dashboard',
      icon: HiOutlineHome,
      exists: true,
    },
  ],
  connections: [
    {
      name: 'Accounts',
      href: '/settings/accounts',
      icon: TbPlugConnected,
      exists: false,
    },
    {
      name: 'Applications',
      href: '/settings/applications',
      icon: TbApps,
      exists: false,
    },
  ],
  advanced: [
    {
      name: 'Advanced Settings',
      href: '/settings/advanced',
      icon: BsGear,
      exists: false,
    },
  ],
}

const AppSubmenu = () => {
  return (
    <div className="pt-6">
      {navigation.general.map((item) => (
        <SideMenuItem key={item.name} item={item} />
      ))}
      <Text size="xs" className="ml-3 pt-5 pb-1 text-gray-500">
        CONNECTIONS
      </Text>
      {navigation.connections.map((item) => (
        <SideMenuItem key={item.name} item={item} />
      ))}
      <Text size="xs" className="ml-3 pt-5 pb-1 text-gray-500">
        ADVANCED
      </Text>
      {navigation.advanced.map((item) => (
        <SideMenuItem key={item.name} item={item} />
      ))}
    </div>
  )
}

const MobileAppSubmenu = () => {
  return (
    <div>
      {navigation.general.map((item) => (
        <SideMenuItem key={item.name} item={item} />
      ))}
      <Text size="xs" className="text-left ml-3 pt-5 pb-1 text-gray-500">
        CONNECTIONS
      </Text>
      {navigation.connections.map((item) => (
        <SideMenuItem key={item.name} item={item} />
      ))}
      <Text size="xs" className="text-left ml-3 pt-5 pb-1 text-gray-500">
        ADVANCED
      </Text>
      {navigation.advanced.map((item) => (
        <SideMenuItem key={item.name} item={item} />
      ))}
    </div>
  )
}
