/**
 * @file app/shared/components/SiteMenu/index.tsx
 */

import * as React from 'react'

import { Link } from '@remix-run/react'

import AppSelect from './appSelect'

// Images
import kubeltLogo from '~/images/kubelt.svg'

// KubeltLogo
// -----------------------------------------------------------------------------

type KubeltLogoProps = {}

const KubeltLogo = (props: KubeltLogoProps) => {
  return (
    <h1 className="text-3xl font-bold text-white my-8 mx-4">
      <Link to="/">
        <img className="inline-block" src={kubeltLogo} />{' '}
        <span className="align-bottom">kubelt</span>
      </Link>
    </h1>
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
    app: {
      title: string
    }
  }[]
  // Current selected application ID.
  selected: string
}

export default function SiteMenu(props: KubeltMenuProps) {
  return (
    <div className="text-center bg-slate-800 pb-4 md:min-h-screen md:w-1/4 md:border-r md:text-left">
      <KubeltLogo />
      <AppSelect apps={props.apps} selected={props.selected} />
    </div>
  )
}
