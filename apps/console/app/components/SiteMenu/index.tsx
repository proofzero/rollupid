/**
 * @file app/shared/components/SiteMenu/index.tsx
 */

import * as React from "react";

import { Link, NavLink } from "@remix-run/react";

import AppSelect from "./appSelect.tsx";

// Images
import kubeltLogo from "~/images/kubelt.svg";

import { Cog8ToothIcon as SettingsIcon } from "@heroicons/react/24/outline";
import { DocumentIcon as SmartContractsIcon } from "@heroicons/react/24/outline";
import { UserIcon as UsersIcon } from "@heroicons/react/24/outline";
import { UsersIcon as TeamIcon } from "@heroicons/react/24/outline";

// KubeltLogo
// -----------------------------------------------------------------------------

type KubeltLogoProps = {
};

const KubeltLogo = (props: KubeltLogoProps) => {
  return (
    <h1 className="text-3xl font-bold text-white my-8 mx-4">
      <Link to="."><img className="inline-block" src={kubeltLogo} /> <span className="align-bottom">kubelt</span></Link>
    </h1>
  );
};

// MenuLink
// -----------------------------------------------------------------------------
// TODO can we replace with NavLink?

type MenuLinkProps = {
  // A link target.
  target: string,
  // The current path being visited.
  current: string,
  // The menu item name.
  name: string,
  // The icon to display.
  icon: React.ForwardedRef<Function>,
  // The text to display.
  text: string,
};

/**
 * A menu item.
 */
const MenuLink = (props: MenuLinkProps) => {
  const isSelected = ( props.target === props.current );
  const selectedStyle = isSelected ? {} : { opacity: 0.6 };
  const selectedClass = isSelected ? 'bg-slate-700' : 'grayscale';
  const icon = React.createElement(props.icon, {
    className: "inline-block w-6 h-6 mr-2",
  });
  return (
    <Link id={`menu-${props.name}`}
      to={props.target}
      className={`block p-4 text-l text-slate-50 ${selectedClass}`} style={selectedStyle}>
      {icon} {props.text}
    </Link>
  );
};

// KubeltMenu
// -----------------------------------------------------------------------------

type KubeltMenuProps = {
  // The current path being visited.
  path: string,
  // An array of application objects.
  // TODO tighten this up
  apps: Array<Object>,
  // Current selected application ID.
  selected: string,
};

export default function SiteMenu(props: KubeltMenuProps) {
  const prefix = `/dashboard/apps/${props.selected}`;

  return (
    <div className="text-center bg-slate-800 pb-4 md:min-h-screen md:w-1/4 md:border-r md:text-left">
      <KubeltLogo />
      <AppSelect apps={props.apps} selected="courtyard" />
      <MenuLink name="settings" target={`${prefix}/settings`} current={props.path} icon={SettingsIcon} text="Settings" />
      <MenuLink name="contracts" target={`${prefix}/contracts`} current={props.path} icon={SmartContractsIcon} text="Smart Contracts" />
      <MenuLink name="users" target={`${prefix}/users`} current={props.path} icon={UsersIcon} text="Users" />
      <MenuLink name="team" target={`${prefix}/team`} current={props.path} icon={TeamIcon} text="Team" />
    </div>
  );
};
