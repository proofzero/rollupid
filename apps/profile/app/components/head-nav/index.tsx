import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Link, NavLink } from '@remix-run/react'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Avatar } from '@proofzero/design-system/src/atoms/profile/avatar/Avatar'

import { FiExternalLink } from 'react-icons/fi'

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import logo from '~/assets/profile_logo.svg'
import mobileLogo from '~/assets/profile_logo_mobile.svg'
import defaultAvatar from '~/assets/circle_gradient.png'
import { UserNavigation, SignOutLink } from '~/components/hean-nav-links'

import styles from './headNav.css'
import { gatewayFromIpfs } from '@proofzero/utils'

export const links = () => [{ rel: 'stylesheet', href: styles }]
// TODO: this should be it's own component. These are also function calls not links
const userNavigation = [
  // { name: 'Copy Address', href: '#' },
  // { name: 'Account', href: '#' },
  { name: 'Sign out', component: SignOutLink },
]

const user = {
  imageUrl: defaultAvatar,
}

type HeadNavProps = {
  basePath?: string
  avatarUrl?: string
  displayName?: string
  isToken?: boolean
  loggedIn?: boolean
}

export default function HeadNav({
  basePath,
  avatarUrl,
  loggedIn,
  displayName,
  isToken = false,
}: HeadNavProps) {
  const activeStyle = {
    fontWeight: 600,
    color: 'white',
    backgroundColor: 'rgb(31 41 55)', // bg-gray-800
  }

  const navigation = [
    {
      name: 'My Profile',
      to: basePath ? `${basePath}` : '/account/connections',
    },
  ]
  return (
    <Disclosure as="nav">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-screen-xl px-4">
            <div className="flex h-20 items-center justify-between px-4 sm:px-0">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="max-w-[180px] hidden md:block"
                    src={logo}
                    alt="Rollup"
                  />
                  <img
                    className="max-w-[180px] block md:hidden"
                    src={mobileLogo}
                    alt="Rollup"
                  />
                </div>
              </div>

              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {!loggedIn && (
                    <div className="flex flex-row items-center space-x-8">
                      <Link to="/auth">
                        <Text
                          weight="semibold"
                          size="sm"
                          className="text-white"
                        >
                          Login
                        </Text>
                      </Link>

                      <a
                        href="https://passport.rollup.id/"
                        className="button-base w-full lg:w-fit bg-white py-3 px-8 rounded-md"
                      >
                        <Text weight="semibold" size="sm">
                          Claim your Rollup
                        </Text>
                      </a>
                    </div>
                  )}

                  {/* Disabled by design request */}
                  {/* {loggedIn && (
                    <button
                      type="button"
                      className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="sr-only">View notifications</span>
                      <HiOutlineBell className="h-6 w-6" aria-hidden="true" />
                    </button>
                  )} */}

                  {/* Profile dropdown */}
                  {loggedIn && (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm">
                          <span className="sr-only">Open user menu</span>
                          <Avatar
                            src={gatewayFromIpfs(avatarUrl) || user.imageUrl}
                            hex={isToken}
                            size="xs"
                            style={
                              isToken
                                ? {
                                    visibility: 'visible',
                                  }
                                : undefined
                            }
                          />
                        </Menu.Button>
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
                        <Menu.Items
                          className="absolute right-0 z-10 mt-2 w-48
                         origin-top-right bg-white py-1
                          shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none rounded-md"
                        >
                          {loggedIn && (
                            <Menu.Item>
                              <UserNavigation
                                avatarUrl={avatarUrl}
                                displayName={displayName}
                                profileUrl={
                                  basePath
                                    ? `${basePath}`
                                    : '/account/connections'
                                }
                              />
                            </Menu.Item>
                          )}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                {loggedIn && (
                  <Disclosure.Button
                    className="inline-flex items-center justify-center bg-gray-800 p-2
                   text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none 
                   focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                )}
                {!loggedIn && (
                  <div className="flex flex-row items-center space-x-8">
                    <a
                      href="https://passport.rollup.id/"
                      className="button-base w-full lg:w-fit bg-white py-3 px-8"
                    >
                      <Text weight="bold" size="sm">
                        Claim your Rollup
                      </Text>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            {({ close }) => (
              <>
                <div className="space-y-1 px-2 pt-3 sm:px-3">
                  {loggedIn &&
                    navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        onClick={() => {
                          close()
                        }}
                        target="_blank"
                        className="flex flex-row items-center block px-3 h-14 text-sm font-medium nav-link-text\
                        border-y border-gray-700 hover:bg-gray-700 w-full"
                        style={({ isActive }) => {
                          return isActive ? activeStyle : undefined
                        }}
                      >
                        <Text
                          size="sm"
                          weight="medium"
                          className="text-white pr-2"
                        >
                          {item.name}
                        </Text>
                        <FiExternalLink size={16} className="text-white" />
                      </NavLink>
                    ))}
                </div>

                {loggedIn && (
                  <div className="flex items-center px-5">
                    {/* <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <HiOutlineBell className="h-6 w-6" aria-hidden="true" />
                  </button> */}
                  </div>
                )}

                <div className="px-2">
                  {loggedIn &&
                    userNavigation.map((item) => {
                      return (
                        <div
                          key={item.name}
                          onClick={() => {
                            close()
                          }}
                        >
                          <item.component
                            className={
                              'block px-3 py-4 hover:bg-gray-700\
                           border-b border-gray-700 md:hidden w-full\
                           text-base font-medium text-white h-full'
                            }
                          />
                        </div>
                      )
                    })}
                </div>
              </>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
