import { BiCog, BiIdCard, BiLink } from "react-icons/bi";
import { HiOutlineHome, HiOutlineViewGridAdd } from "react-icons/hi";
import SideNavItem from "./SideNavItem";
import sideNavStyles from "./side-nav.css";

export function links() {
  return [{ rel: "stylesheet", href: sideNavStyles }];
}

const subNavigation = [
  {
    name: "Dashboard",
    href: "#",
    icon: HiOutlineHome,
    current: true,
    exists: true,
  },
  {
    name: "NFT Gallery",
    href: "#",
    icon: HiOutlineViewGridAdd,
    current: false,
  },
  { name: "KYC", href: "#", icon: BiIdCard, current: false },
  { name: "0xAuth", href: "#", icon: BiLink, current: false },
  { name: "Settings", href: "#", icon: BiCog, current: false },
];

const SideNav = () => {
  return (
    <aside className="lg:col-start-1 lg:col-end-3 bg-gray-50">
      <nav className="space-y-1">
        {subNavigation.map((item) => (
          <SideNavItem key={item.name} item={item} />
        ))}
      </nav>
    </aside>
  );
};

export default SideNav;
