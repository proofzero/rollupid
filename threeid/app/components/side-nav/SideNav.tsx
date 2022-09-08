import { BiCog, BiIdCard, BiLink } from "react-icons/bi";
import { HiOutlineHome, HiOutlineViewGridAdd } from "react-icons/hi";
import SideNavItem from "./SideNavItem";

const subNavigation = [
  {
    name: "Dashboard",
    href: "/account",
    icon: HiOutlineHome,
    current: true,
    exists: true,
  },
  {
    name: "NFT Gallery",
    href: "/notaccount",
    icon: HiOutlineViewGridAdd,
    current: false,
  },
  { name: "KYC", href: "#", icon: BiIdCard, current: false },
  { name: "0xAuth", href: "#", icon: BiLink, current: false },
  { name: "Settings", href: "#", icon: BiCog, current: false },
];

const SideNav = () => {
  return (
    <aside className="fixed bottom-0 w-full lg:relative lg:col-start-1 lg:col-end-3 bg-gray-50">
      <nav className="flex flex-row justify-center items-center lg:flex-none lg:block space-y-1">
        {subNavigation.map((item) => (
          <SideNavItem key={item.name} item={item} />
        ))}
      </nav>
    </aside>
  );
};

export default SideNav;
