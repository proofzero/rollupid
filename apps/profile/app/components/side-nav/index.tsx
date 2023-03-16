import { Link, useSubmit } from '@remix-run/react'

import { BiLink } from 'react-icons/bi'
import { AiOutlineUser } from 'react-icons/ai'
import { RiCollageLine } from 'react-icons/ri'
import { IoMdExit } from 'react-icons/io'
import { HiOutlineExternalLink } from 'react-icons/hi'

import { Text } from '@kubelt/design-system'
import { Toaster } from '@kubelt/design-system/src/atoms/toast'

import { SideNavItem } from './item'

const subNavigation = {
  publicProfiles: [
    {
      name: 'User Settings',
      href: '/account/profile',
      icon: AiOutlineUser,
      exists: true,
    },
    {
      name: 'Profile Links',
      href: '/account/links',
      icon: BiLink,
      exists: true,
    },
    {
      name: 'NFT Gallery',
      href: '/account/gallery',
      icon: RiCollageLine,
      exists: true,
    },
  ],
}

export const DesktopSideNav = ({
  profile,
  accountURN,
}: {
  profile: { displayName: string; pfp?: { image: string } }
  accountURN: string
}) => {
  return (
    <aside className="fixed bottom-0 z-50 w-full lg:relative lg:col-start-1 lg:col-end-3 bg-gray-50">
      <nav
        className="flex flex-row justify-center items-center lg:flex-none 
      hidden lg:block space-y-1"
      >
        <SideNavBarebone profile={profile} accountURN={accountURN} />
      </nav>
    </aside>
  )
}

export const MobileSideNav = ({
  profile,
  accountURN,
}: {
  profile: { displayName: string; pfp?: { image: string } }
  accountURN: string
}) => {
  const submit = useSubmit()

  return (
    <nav
      className="flex-none justify-center items-center 
       block relative h-full"
    >
      <SideNavBarebone profile={profile} accountURN={accountURN} />

      <button
        className="absolute bottom-0 px-4 py-4 hover:bg-gray-100 w-full
         text-left flex items-center text-red-500 text-sm"
        style={{ cursor: 'pointer' }}
        onClick={() => submit(null, { method: 'post', action: '/signout/' })}
      >
        <IoMdExit size={22} className="mr-2" />
        <Text className="truncate" size="sm" weight="medium">
          Sign Out
        </Text>
      </button>
    </nav>
  )
}

export const SideNavBarebone = ({
  profile,
  accountURN,
}: {
  profile: { displayName: string; pfp?: { image: string } }
  accountURN: string
}) => {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="flex flex-row items-center mx-3 pb-6 pt-8 truncate">
        <img
          src={profile.pfp?.image}
          className="w-[42px] h-[42px] rounded-full mr-2"
          alt="PFP"
        />
        <div className="flex-1 w-1 flex flex-col">
          <Text size="sm" weight="medium" className="truncate mb-1.5">
            {profile.displayName}
          </Text>
          <Link
            to={`/p/${accountURN}`}
            target="_blank"
            className="flex flex-row items-center text-indigo-500"
          >
            <Text size="xs" className="truncate">
              Open my Profile
            </Text>
            <HiOutlineExternalLink size={16} className="ml-2" />
          </Link>
        </div>
      </div>
      {subNavigation.publicProfiles.map((item) => (
        <SideNavItem key={item.name} item={item} />
      ))}
    </>
  )
}
