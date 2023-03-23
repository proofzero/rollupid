import { Fragment } from 'react'
import { Avatar } from '@proofzero/design-system'
import { NavLink } from '@remix-run/react'
import { Menu, Transition } from '@headlessui/react'
import PassportIcon from '../../assets/PassportIcon.svg'

import { IoMdExit } from 'react-icons/io'
import { Text } from '@proofzero/design-system'

const Header = ({ pfpUrl }: { pfpUrl: string }) => {
  return (
    <div
      className="w-full min-h-[80px] h-[80px] border-b bg-white
    flex items-center justify-start lg:justify-end px-2"
    >
      <NavLink to="/settings">
        <img
          src={PassportIcon}
          alt="Passport Icon"
          className="h-[40px] w-[40px] lg:hidden"
        />
      </NavLink>
      <div className="hidden lg:block">
        <Menu>
          <Menu.Button className={'rounded-full bg-gray-800'}>
            <Avatar size="xs" src={pfpUrl} />
          </Menu.Button>
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
              className="absolute right-2 z-10 mt-2 w-48
             origin-top-right bg-white py-1
             shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none rounded-md"
            >
              <Menu.Item>
                {({ active }) => {
                  return (
                    <NavLink
                      to="/signout"
                      className={`${active ? 'bg-gray-100' : ''} block px-4 py-2
                       text-sm  hover:bg-gray-100' w-full text-left
                       flex flex-row items-center text-red-500`}
                      style={{ cursor: 'pointer' }}
                    >
                      <IoMdExit size={22} className="mr-2" />
                      <Text className="truncate" size="sm" weight="medium">
                        Sign Out
                      </Text>
                    </NavLink>
                  )
                }}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  )
}

export default Header
