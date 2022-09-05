import { useState } from "react";

import { HiOutlineViewGridAdd, HiMenu } from "react-icons/hi";
import {
  BiUser,
  BiAt,
  BiWalletAlt,
  BiHome,
  BiLink,
  BiIdCard,
  BiCog,
} from "react-icons/bi";

import SideMenuItem, { SideMenuItemProps } from "./SideMenuItem";

import styles from "./sideMenu.css";

export const links = () => [{ rel: "stylesheet", href: styles }];

type SideMenuProps = {
  username: string | null;
  avatarUri: string | null;
  avatarSize: Number | null;
};

const sideMenuItems: SideMenuItemProps[] = [
  {
    title: "Dashboard",
    screen: "Onboard",
    Icon: BiHome,
  },
  {
    title: "NFT Gallery",
    Icon: HiOutlineViewGridAdd,
  },
  {
    title: "KYC",
    Icon: BiIdCard,
  },
  {
    title: "Connected dApps",
    Icon: BiLink,
  },
  {
    title: "Settings",
    Icon: BiCog,
  },
];

export default function SideMenu({
  username,
  avatarUri,
  avatarSize = 48,
}: SideMenuProps) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="bg-dull-white side-menu-pad">
      <div className="flex-row justify-between">
        <div className="flex-row side-menu-avatar">
          {/* TODO: is this a good way of setting avatar size? */}
          <div className={`w-[${avatarSize}px] h-[${avatarSize}px] mr-48`}>
            <img
              src={avatarUri ? avatarUri : require("../../assets/avatar.png")}
              alt="profile avatar?"
            />
          </div>

          <div className="justify-between">
            <div className="side-menu-username">{username}</div>
          </div>
        </div>
        {/* TODO: implement this behaviour for mobile? 
        isMobile ?? {
        <div>
          <HiMenu />
        </div>} */}
      </div>
      {expanded && (
        <div>
          {sideMenuItems.map((smi) => (
            <SideMenuItem key={smi.title} {...smi} />
          ))}
        </div>
      )}
    </div>
  );
}
