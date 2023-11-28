import { Fragment, useState } from 'react'
import { Avatar } from '@proofzero/design-system'
import { FetcherWithComponents, NavLink } from '@remix-run/react'
import { Menu, Transition } from '@headlessui/react'

import { PassportLogo } from '../SideMenu'

// import PassportIcon from '../../assets/PassportIcon.svg'

import { HiOutlineLogout } from 'react-icons/hi'
import { Text } from '@proofzero/design-system'

import { usePostHog } from 'posthog-js/react'
import { AccountURN } from '@proofzero/urns/account'
import EditProfileModal from '~/components/EditProfileModal'
import { TbUserEdit } from 'react-icons/tb'

const Header = ({
  pfpUrl,
  accounts,
  primaryAccountURN,
  editProfileFetcher,
}: {
  pfpUrl: string
  accounts: {
    URN: AccountURN
    icon?: string
    title: string
  }[]
  primaryAccountURN: AccountURN
  editProfileFetcher: FetcherWithComponents<any>
}) => {
  const posthog = usePostHog()
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false)

  return (
    <>
      <EditProfileModal
        isOpen={editProfileModalOpen}
        setIsOpen={setEditProfileModalOpen}
        accounts={accounts}
        primaryAccountURN={primaryAccountURN}
        fetcher={editProfileFetcher}
      />
      <header className="w-full min-h-[80px] h-[80px] border-b bg-white lg:b-gray-50 flex items-center justify-start lg:justify-end px-2 md:px-10">
        <div className="lg:hidden">
          <PassportLogo />
        </div>
        <div className="max-lg:hidden">
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
              <Menu.Items className="absolute right-2 z-10 mt-2 w-56 origin-top-right bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none rounded-md">
                <Menu.Item>
                  {({ active }) => {
                    return (
                      <button
                        type="button"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left flex flex-row items-center"
                        onClick={() => setEditProfileModalOpen(true)}
                      >
                        <TbUserEdit size={22} className="mr-2 text-gray-600" />
                        <Text
                          size="sm"
                          weight="medium"
                          className="text-gray-700"
                        >
                          Edit Passport Profile
                        </Text>
                      </button>
                    )
                  }}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => {
                    return (
                      <NavLink
                        to="/signout"
                        onClick={() => posthog?.reset()}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2
                       text-sm  hover:bg-gray-100' w-full text-left
                       flex flex-row items-center text-red-500`}
                        style={{ cursor: 'pointer' }}
                      >
                        <HiOutlineLogout size={22} className="mr-2" />
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
      </header>
    </>
  )
}

export default Header
