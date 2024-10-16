/**
 * @file app/components/SideMenu/index.tsx
 */

import React, { useState, Fragment } from 'react'
import { usePopper } from 'react-popper'

import { NavLink } from '@remix-run/react'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

// Images
import passportLogo from '../../assets/PassportLogoBlack.svg'
import consoleLogo from '../../assets/consoleLogo.svg'
import {
  HiOutlineHome,
  HiOutlineExternalLink,
  HiOutlineCog,
  HiOutlineLogout,
} from 'react-icons/hi'
import { TbPlugConnected, TbApps } from 'react-icons/tb'

import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { SideMenuItem } from './Item'
import { Avatar } from '@proofzero/design-system'

const activeStyle = {
  backgroundColor: 'rgb(243 244 246)',
  borderColor: '#6366f1',
  fontWeight: 600,
  color: '#1f2937',
}

// Passport Logo
// -----------------------------------------------------------------------------
export const PassportLogo = () => {
  return (
    <NavLink to="/settings">
      <img
        className="mx-4  h-[40px] lg:h-[80px] max-w-[180px]"
        src={passportLogo}
        alt="passport logo"
      />
    </NavLink>
  )
}

const ConsolenNavItem = ({ CONSOLE_URL }: { CONSOLE_URL: string }) => {
  return (
    <NavLink
      target="_blank"
      to={CONSOLE_URL}
      style={({ isActive }) => {
        return isActive ? activeStyle : undefined
      }}
      className={({ isActive }) => `text-sm group ${
        isActive ? 'border-l-2' : ''
      } px-4 py-4
               flex self-center justify-between
               flex-row  items-center
               hover:bg-gray-100`}
    >
      <div className="flex flex-row items-center">
        <img
          src={consoleLogo}
          className="mr-3 -ml-1 h-6 w-6"
          alt="console logo"
        />

        <span className={'self-center'}>
          <Text
            className="truncate self-center text-gray-600"
            size="sm"
            weight="medium"
          >
            Developer Console
          </Text>
        </span>
      </div>
      <HiOutlineExternalLink size={22} />
    </NavLink>
  )
}

// PassportMenu
// -----------------------------------------------------------------------------

type PassportMenuProps = {
  open: boolean
  CONSOLE_URL: string
  pfpUrl: string
  displayName: string
}

export default function SideMenu({
  open,
  CONSOLE_URL,
  pfpUrl,
  displayName,
}: PassportMenuProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { attributes } = usePopper(referenceElement, popperElement)

  return (
    <div
      className="text-center bg-white lg:min-h-[100dvh]
    lg:min-w-[256px] lg:max-w-sm lg:border-r lg:text-left
    flex flex-col lg:sticky lg:top-0 max-h-[100dvh]"
    >
      {/* Desktop Menu */}
      <div className="hidden lg:block h-full">
        <div className="object-left">
          <PassportLogo />
        </div>
        <AppSubmenu />
      </div>
      <div className="mt-auto hidden border-t lg:block">
        <ConsolenNavItem CONSOLE_URL={CONSOLE_URL} />
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Popover.Button
          ref={setReferenceElement}
          className="absolute top-0 right-2 sm:max-md:right-5 md:right-10
                my-[19px] items-right rounded-lg
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
          bg-white border mt-[80px] lg:hidden z-[100]
          min-h-[416px] h-[calc(100dvh-80px)] max-h-[calc(100dvh-80px)] w-[280px]
          `}
          ref={setPopperElement}
          style={{ position: 'absolute', right: '0', top: '0' }}
          {...attributes.popper}
        >
          {({ close }) => {
            return (
              <div className="flex h-full flex-col">
                <MobileAppSubmenu close={close} />
                <div className="mt-auto block border-t lg:hidden">
                  <ConsolenNavItem CONSOLE_URL={CONSOLE_URL} />
                  <NavLink
                    to={'/signout'}
                    onClick={() => {
                      close()
                    }}
                    style={({ isActive }) => {
                      return isActive ? activeStyle : undefined
                    }}
                    className={({ isActive }) => `text-sm group ${
                      isActive ? 'border-l-2' : ''
                    } px-4 py-4
                  flex self-center justify-between w-full
                  flex-row items-center text-gray-600 hover:bg-gray-100`}
                  >
                    <div className="flex flex-row items-center">
                      <div
                        className="flex items-center
                      rounded-full bg-gray-800 mr-3 -ml-2"
                      >
                        <Avatar src={pfpUrl} size="2xs" />
                      </div>

                      <span className={'self-center'}>
                        <Text
                          className="max-w-[140px]
                        truncate self-center"
                          size="sm"
                          weight="medium"
                        >
                          {displayName}
                        </Text>
                      </span>
                    </div>
                    <HiOutlineLogout size={24} />
                  </NavLink>
                </div>
              </div>
            )
          }}
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
      exists: true,
    },
    {
      name: 'Applications',
      href: '/settings/applications',
      icon: TbApps,
      exists: true,
    },
  ],
  advanced: [
    {
      name: 'Advanced Settings',
      href: '/settings/advanced',
      icon: HiOutlineCog,
      exists: true,
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

const MobileAppSubmenu = ({ close }: { close: () => void }) => {
  return (
    <div>
      {navigation.general.map((item) => (
        <SideMenuItem key={item.name} item={item} close={close} />
      ))}
      <Text size="xs" className="text-left ml-3 pt-5 pb-1 text-gray-500">
        CONNECTIONS
      </Text>
      {navigation.connections.map((item) => (
        <SideMenuItem key={item.name} item={item} close={close} />
      ))}
      <Text size="xs" className="text-left ml-3 pt-5 pb-1 text-gray-500">
        ADVANCED
      </Text>
      {navigation.advanced.map((item) => (
        <SideMenuItem key={item.name} item={item} close={close} />
      ))}
    </div>
  )
}
