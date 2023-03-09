/**
 * @file app/shared/components/SiteHeader/index.tsx
 */

import { Form } from '@remix-run/react'
import { gatewayFromIpfs } from '@kubelt/utils'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

import classNames from 'classnames'
import SignOutLink from './sign-out-link'
import ProfileLink from './profile-link'

// RollupHeader
// -----------------------------------------------------------------------------

const userNavigation = [
  // { name: 'Copy Address', href: '#' },
  { name: 'Profile', component: ProfileLink },
  { name: 'Sign out', component: SignOutLink },
]

type RollupHeaderProps = {
  avatarUrl: string
  profileURL: string
}

export default function RollupHeader(props: RollupHeaderProps) {
  return (
    <header className="flex flex-row-reverse shadow p-4 bg-white text-slate-500">
      <Form action="/signout" method="post">
        <Menu as="div" className="relative ml-3">
          <div>
            <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm">
              <span className="sr-only">Open user menu</span>
              <Avatar src={gatewayFromIpfs(props.avatarUrl) || ''} size="xs" />
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
              {userNavigation.map((item) => (
                <Menu.Item key={item.name}>
                  {({ active }) => (
                    <item.component
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      )}
                      profileURL={props.profileURL}
                    />
                  )}
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </Form>
    </header>
  )
}
