/**
 * @file app/shared/components/SiteMenu/index.tsx
 */

import * as React from 'react'

import { Link, NavLink } from '@remix-run/react'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import AppSelect from './appSelect'

// Images
import consoleLogo from '~/images/3id_console_logo.svg'
import {
  HiOutlineChartSquareBar,
  HiOutlineCog,
  HiOutlineDocument,
  HiOutlineHome,
  HiOutlineUsers,
} from 'react-icons/hi'

// KubeltLogo
// -----------------------------------------------------------------------------
const KubeltLogo = () => {
  return (
    <Link to="/">
      <img className="mx-4 my-5" src={consoleLogo} />
    </Link>
  )
}

// MenuLink
// -----------------------------------------------------------------------------
// TODO can we replace with NavLink?

type MenuLinkProps = {
  // A link target.
  target: string
  // The current path being visited.
  current: string
  // The menu item name.
  name: string
  // The icon to display.
  icon: React.ForwardedRef<Function>
  // The text to display.
  text: string
}

/**
 * A menu item.
 */
const MenuLink = (props: MenuLinkProps) => {
  const isSelected = props.target === props.current
  const selectedStyle = isSelected ? {} : { opacity: 0.6 }
  const selectedClass = isSelected ? 'bg-slate-700' : 'grayscale'
  const icon = React.createElement(props.icon, {
    className: 'inline-block w-6 h-6 mr-2',
  })
  return (
    <Link
      id={`menu-${props.name}`}
      to={props.target}
      className={`block p-4 text-l text-slate-50 ${selectedClass}`}
      style={selectedStyle}
    >
      {icon} {props.text}
    </Link>
  )
}

// KubeltMenu
// -----------------------------------------------------------------------------

type KubeltMenuProps = {
  // An array of application objects.
  // TODO tighten this up
  apps: {
    clientId: string
    name: string
    icon: string
  }[]
  // Current selected application ID.
  selected?: string
}

const menuItemClass = (isActive: boolean, disabled: boolean = false) =>
  `flex flex-row space-x-3 items-center p-2 rounded-md hover:bg-gray-800 hover:text-white ${
    isActive ? 'bg-gray-800 text-white' : 'text-gray-400'
  } ${disabled ? 'hover:cursor-not-allowed' : ''}`

export default function SiteMenu(props: KubeltMenuProps) {
  return (
    <div className="text-center bg-gray-900 pb-4 md:min-h-screen md:min-w-[256px] md:max-w-sm md:border-r md:text-left">
      <KubeltLogo />
      <AppSelect apps={props.apps} selected={props.selected} />

      {props.selected && (
        <section className="pt-5 px-2 hidden md:flex md:flex-col">
          <NavLink
            to={`/apps/${props.selected}`}
            end
            className={({ isActive }) => menuItemClass(isActive)}
          >
            <HiOutlineHome className="w-6 h-6" />{' '}
            <Text size="sm" weight="medium">
              Dashboard
            </Text>
          </NavLink>

          <NavLink
            to={`/apps/${props.selected}/auth`}
            end
            className={({ isActive }) => menuItemClass(isActive)}
          >
            <HiOutlineCog className="w-6 h-6" />{' '}
            <Text size="sm" weight="medium">
              0xAuth
            </Text>
          </NavLink>

          <NavLink
            to={`/apps/${props.selected}/soon`}
            end
            className={({ isActive }) => menuItemClass(isActive, true)}
            onClick={(e) => e.preventDefault()}
          >
            <HiOutlineDocument className="w-6 h-6" />{' '}
            <Text size="sm" weight="medium">
              Smart Contracts
            </Text>
          </NavLink>

          <NavLink
            to={`/apps/${props.selected}/soon`}
            end
            className={({ isActive }) => menuItemClass(isActive, true)}
            onClick={(e) => e.preventDefault()}
          >
            <HiOutlineChartSquareBar className="w-6 h-6" />{' '}
            <Text size="sm" weight="medium">
              Users
            </Text>
          </NavLink>

          <NavLink
            to={`/apps/${props.selected}/soon`}
            end
            className={({ isActive }) => menuItemClass(isActive, true)}
            onClick={(e) => e.preventDefault()}
          >
            <HiOutlineUsers className="w-6 h-6" />{' '}
            <Text size="sm" weight="medium">
              Team
            </Text>
          </NavLink>
        </section>
      )}
    </div>
  )
}
