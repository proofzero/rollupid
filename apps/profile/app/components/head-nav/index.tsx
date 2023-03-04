import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Link, NavLink } from '@remix-run/react'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames'

import logo from '~/assets/profile_logo.svg'
import defaultAvatar from '~/assets/circle_gradient.png'
import { SignOutLink, ConsoleLink } from '~/components/hean-nav-links'

import styles from './headNav.css'
import { gatewayFromIpfs } from '@kubelt/utils'

export const links = () => [{ rel: 'stylesheet', href: styles }]

// TODO: this should be it's own component. These are also function calls not links
const userNavigation = [
  // { name: 'Copy Address', href: '#' },
  // { name: 'Account', href: '#' },
  { name: 'Console', component: ConsoleLink },
  { name: 'Sign out', component: SignOutLink },
]

const user = {
  imageUrl: defaultAvatar,
}

type HeadNavProps = {
  basePath: string | undefined
  avatarUrl?: string | undefined
  isToken?: boolean | undefined
  loggedIn?: boolean | undefined
  consoleURL: string
}

export default function HeadNav({
  basePath,
  avatarUrl,
  loggedIn,
  isToken = false,
  consoleURL,
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
                  <img className="max-w-[180px]" src={logo} alt="Rollup" />
                </div>

                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {loggedIn &&
                      navigation.map((item) => (
                        // TODO: convert to NavLink to remove "disabled" and "current" https://remix.run/docs/en/v1/api/remix#navlink
                        <NavLink
                          key={item.name}
                          to={item.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          // @ts-ignore
                          style={({ isActive }) => {
                            return isActive ? activeStyle : undefined
                          }}
                          className={
                            'px-3 py-2 text-white text-sm font-medium nav-link-text rounded-md hover:bg-gray-800'
                          }
                        >
                          {item.name}
                        </NavLink>
                      ))}
                  </div>
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
                          {loggedIn &&
                            userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <item.component
                                    consoleURL={consoleURL}
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                    )}
                                  />
                                )}
                              </Menu.Item>
                            ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                {loggedIn && (
                  <Disclosure.Button className="inline-flex items-center justify-center bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
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

          <Disclosure.Panel className="border-b border-gray-700 md:hidden">
            <div className="space-y-1 px-2 py-3 sm:px-3">
              {loggedIn &&
                navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    // @ts-ignore
                    style={({ isActive }) => {
                      return isActive ? activeStyle : undefined
                    }}
                    className={
                      'block px-3 py-2 text-sm font-medium nav-link-text'
                    }
                  >
                    <Text size="sm" weight="medium" className="text-white">
                      {item.name}
                    </Text>
                  </NavLink>
                ))}
            </div>

            <div className="border-t border-gray-700 pt-4 pb-3">
              {loggedIn && (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
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
                  </div>
                  {/* <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <HiOutlineBell className="h-6 w-6" aria-hidden="true" />
                  </button> */}
                </div>
              )}

              <div className="mt-3 space-y-1 px-2">
                {loggedIn &&
                  userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={item.component}
                      className="block px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    />
                  ))}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
