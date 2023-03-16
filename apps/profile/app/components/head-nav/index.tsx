import { Fragment, useState } from 'react'
import { Popover, Menu, Transition } from '@headlessui/react'
import { Link } from '@remix-run/react'
import { usePopper } from 'react-popper'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Avatar } from '@proofzero/design-system/src/atoms/profile/avatar/Avatar'

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import logo from '~/assets/profile_logo.svg'
import mobileLogo from '~/assets/profile_logo_mobile.svg'
import defaultAvatar from '~/assets/circle_gradient.png'
import { UserNavigation } from '~/components/hean-nav-links'

import styles from './headNav.css'
import { gatewayFromIpfs } from '@kubelt/utils'
import { MobileSideNav } from '../side-nav'

export const links = () => [{ rel: 'stylesheet', href: styles }]

const user = {
  imageUrl: defaultAvatar,
}

type HeadNavProps = {
  open: boolean
  accountURN: string
  avatarUrl?: string
  displayName?: string
  isToken?: boolean
  loggedIn?: boolean
}

export default function HeadNav({
  accountURN,
  avatarUrl,
  loggedIn,
  displayName,
  open,
  isToken = false,
}: HeadNavProps) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { styles, attributes } = usePopper(referenceElement, popperElement)

  return (
    <div>
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
                className={`max-w-[180px] block md:hidden transition-opacity ${
                  open ? 'opacity-50' : ''
                }`}
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
                    <Text weight="semibold" size="sm" className="text-white">
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
                              accountURN
                                ? `/p/${accountURN}`
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
              <Popover.Button
                ref={setReferenceElement}
                className="inline-flex items-center justify-center bg-gray-800 p-2
                   text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none 
                   focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800
                   rounded-lg
                   "
              >
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Popover.Button>
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

      <Popover.Panel
        className={`
            ${open ? 'fixed right-0' : ''}
            md:hidden h-full col-start-1 col-end-3 bg-gray-50
            border mt-5 absolute bottom-0 z-[100] 
             h-[calc(100vh-80px)] w-[240px]`}
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {({ close }) => (
          <MobileSideNav
            profile={{
              pfp: { image: avatarUrl! },
              displayName: displayName!,
            }}
            accountURN={accountURN!}
          />
        )}
      </Popover.Panel>
    </div>
  )
}
