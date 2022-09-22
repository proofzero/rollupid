import { redirect } from "@remix-run/cloudflare";
import { useLoaderData, useSubmit, NavLink } from "@remix-run/react";

import { Outlet } from "@remix-run/react";

import { useState } from "react";

import { BiCog, BiIdCard, BiLink } from "react-icons/bi";
import { HiOutlineHome, HiOutlineViewGridAdd } from "react-icons/hi";

import { getUserSession, requireJWT } from "~/utils/session.server";

import { oortSend } from "~/utils/rpc.server";

import styles from "~/styles/account.css";
import { links as buttonStyles } from "~/components/base-button";
import { links as faqStyles } from "~/components/FAQ";
import { links as invCodeStyles } from "~/components/invite-code";
import HeadNav from "~/components/head-nav";
import ConditionalTooltip from "~/components/conditional-tooltip";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

export function links() {
  return [
    ...invCodeStyles(),
    ...buttonStyles(),
    ...faqStyles(),
    { rel: "stylesheet", href: styles },
  ];
}

// @ts-ignore
export const loader = async ({ request }) => {
  const jwt = await requireJWT(request, "/auth")

  const session = await getUserSession(request);
  const address = session.get("address");

  // gate with invites only
  const claimsRes = await oortSend(
    "kb_getCoreClaims",
    [],
    { jwt: jwt, cookie: request.headers.get("Cookie") },
  );

  if (!claimsRes.result.includes("3id.enter")) {
    return redirect(`/auth`);
  }

  // @ts-ignore
  const onboardData = await ONBOARD_STATE.get(address);
  if (!onboardData) {
    // @ts-ignore
    await ONBOARD_STATE.put(address, "true");

    return redirect(`/onboard/nickname`);
  }

  return null;
};

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
    href: "#",
    icon: HiOutlineViewGridAdd,
    current: false,
  },
  { name: "KYC", href: "#", icon: BiIdCard, current: false },
  { name: "0xAuth", href: "#", icon: BiLink, current: false },
  { name: "Settings", href: "#", icon: BiCog, current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function AccountLayout() {
  useLoaderData();
  let submit = useSubmit();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: sort out layout component

  // TODO: port over welcome screen

  return (
    <>
      <div className="min-h-full">
        <div className="header">
          <HeadNav />
        </div>

        <main className="-mt-72">
          <div className="mx-auto max-w-screen-xl lg:px-4 pb-6 sm:px-6 lg:px-8 lg:pb-16">
            <div className="overflow-hidden bg-white shadow">
              <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                <aside className="fixed bottom-0 w-full lg:relative lg:col-start-1 lg:col-end-3 bg-gray-50">
                  <nav className="flex flex-row justify-center items-center lg:flex-none lg:block lg:mt-8 space-y-1">
                    {subNavigation.map((item) => (
                      <SideNavItem key={item.name} item={item} />
                    ))}
                  </nav>
                </aside>
                <div className="divide-y divide-gray-200 px-4 sm:mb-16 lg:col-start-3 lg:col-end-13 lg:p-4 lg:p-8">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

type SideNavItemProps = {
  item: {
    name: string;
    href: string;
    icon: any;
    current: boolean;
    exists?: boolean;
  };
};

const SideNavItem = ({ item }: SideNavItemProps) => {
  const activeStyle = {};
  return (
    <div
      className={`${item.current ? "bg-gray-100" : "lg:bg-transparent hover:bg-gray-100"
        } basis-1/4 lg:w-100`}
    >
      <NavLink
        to={item.href}
        aria-current={item.current ? "page" : undefined}
        className="group lg:border-l-4 px-3 py-2 flex justify-center items-center flex-row lg:justify-start lg:items-start"
      // if href is "" or "#" isActive is true so we can't use this yet
      // style={({ isActive }) =>
      //     isActive ? activeStyle : undefined
      // }
      >
        <item.icon
          className={classNames(
            !item.current && "opacity-25",
            "flex-shrink-0 -ml-1 lg:mr-3 h-6 w-6"
          )}
          style={{
            color: item.current ? "#4B5563" : "#9CA3AF",
          }}
          aria-hidden="true"
        />

        <ConditionalTooltip content="Coming Soon" condition={!item.exists}>
          <span
            className={classNames(
              !item.current && "opacity-25",
              "hidden lg:block"
            )}
          >
            {item.current && (
              <Text
                className="truncate"
                size={TextSize.Base}
                weight={TextWeight.Medium500}
                color={TextColor.Gray600}
              >
                {item.name}
              </Text>
            )}
            {!item.current && (
              <Text
                className="truncate"
                size={TextSize.Base}
                weight={TextWeight.Medium500}
                color={TextColor.Gray400}
              >
                {item.name}
              </Text>
            )}
          </span>
        </ConditionalTooltip>
      </NavLink>
    </div>
  );
};
