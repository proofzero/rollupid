/**
 * @file app/shared/components/SiteMenu/index.tsx
 */

import React, { Fragment, useState } from 'react'

import { useSubmit, Link, NavLink } from '@remix-run/react'
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
  HiOutlineLogout,
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
import { Popover, Transition } from '@headlessui/react'
import { usePopper } from 'react-popper'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import type { IconType } from 'react-icons'
import { Avatar } from '@proofzero/design-system'

// RollupLogo
// -----------------------------------------------------------------------------
export const ConsoleLogo = () => {
  return (
    <Link to="/">
      <img
        className="mx-4 my-5 h-[40px] lg:h-[80px] max-w-[180px]"
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
  open: boolean
  PASSPORT_URL: string
  pfpUrl: string
  displayName: string
}

const menuItemClass = (isActive: boolean, disabled: boolean = false) =>
  `flex flex-row space-x-3 items-center p-2 rounded-md hover:bg-gray-800 hover:text-white ${
    isActive ? 'bg-gray-800 text-white' : 'text-gray-400'
  } ${disabled ? 'hover:cursor-not-allowed' : ''}`

export default function SiteMenu(props: RollupMenuProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { attributes } = usePopper(referenceElement, popperElement)

  const submit = useSubmit()

  return (
    <div
      className="text-center bg-gray-900 lg:min-h-screen
    lg:min-w-[256px] lg:max-w-sm lg:text-left
    flex flex-col lg:min-h-screen lg:sticky lg:top-0 max-h-screen"
    >
      {/* Desktop menu */}
      <div className="hidden lg:block object-left">
        <ConsoleLogo />
      </div>
      <div className="hidden lg:block overflow-scroll">
        <AppMenu props={props} />
      </div>

      <div className="hidden lg:block mt-auto">
        <ExternalLinks
          PASSPORT_URL={props.PASSPORT_URL}
          docsURL={'https://docs.rollup.id'}
        />
      </div>
      {/* Mobile menu */}
      <div className="lg:hidden">
        <Popover.Button
          ref={setReferenceElement}
          className="absolute top-0 right-2 sm:max-md:right-5 md:right-10
              top-0 my-5 items-right rounded-lg
              justify-right bg-gray-800 p-2 text-gray-400 hover:bg-gray-700
              hover:text-white focus:outline-none focus:ring-2 focus:ring-white
              focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <span className="sr-only">Open main menu</span>
          {props.open ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </Popover.Button>
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
        flex flex-col bg-gray-900 mt-[80px] lg:hidden z-50
        min-h-[706px] h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] w-[280px] overflow-scroll
        `}
            ref={setPopperElement}
            style={{ position: 'absolute', right: '0', top: '0' }}
            {...attributes.popper}
          >
            {({ close }) => (
              <>
                <AppMenu props={props} close={close} />
                <div className="mt-auto">
                  <ExternalLinks
                    PASSPORT_URL={props.PASSPORT_URL}
                    docsURL={'https://docs.rollup.id'}
                    close={close}
                  />
                </div>
                <div
                  className="px-2 py-2 w-full bg-gray-700 hover:bg-gray-700 sticky bottom-0
              z-[60]"
                >
                  <button
                    onClick={() => {
                      close()
                      submit(null, { method: 'post', action: 'signout' })
                    }}
                    className={`w-full flex self-center justify-between w-full
                  flex-row items-center -mr-3 text-gray-400 hover:text-white max-w-[260px]
                  z-[70]`}
                  >
                    <div className="flex flex-row items-center ">
                      <div
                        className="flex items-center
                        rounded-full bg-gray-800 mr-3 "
                      >
                        <Avatar src={props.pfpUrl} size="2xs" />
                      </div>

                      <span className={'self-center'}>
                        <Text
                          className="max-w-[140px] text-white
                          truncate self-center"
                          size="sm"
                          weight="medium"
                        >
                          {props.displayName}
                        </Text>
                      </span>
                    </div>

                    <HiOutlineLogout size={24} />
                  </button>
                </div>
              </>
            )}
          </Popover.Panel>
        </Transition>
      </div>
    </div>
  )
}

type AppMenuProps = {
  props: RollupMenuProps
  close?: () => void
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

const AppSubmenu = (appSubroute: string, close?: () => void) =>
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
            onClick={(e) => {
              if (al.disabled) e.preventDefault()
              if (close) close()
            }}
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

function AppMenu({ props, close }: AppMenuProps) {
  return (
    <div>
      <AppSelect apps={props.apps} selected={props.selected} close={close} />

      {props.selected && (
        <section className="px-2 lg:flex lg:flex-col">
          {AppSubmenu(props.selected, close)}
        </section>
      )}
    </div>
  )
}

type ExternalLinksProps = {
  PASSPORT_URL: string
  docsURL: string
  close?: () => void
}

function ExternalLinks({ PASSPORT_URL, docsURL }: ExternalLinksProps) {
  return (
    <div className="mt-2 border-t border-gray-700">
      {/* Hidden until new passport lands */}
      <div className="px-2 pt-2 hidden hover:bg-gray-800">
        <NavLink
          to={PASSPORT_URL}
          target="_blank"
          className={({ isActive }) => `${menuItemClass(isActive, false)} `}
          onClick={() => {
            if (close) close()
          }}
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
      <div className="px-2 py-2 hover:bg-gray-800">
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
