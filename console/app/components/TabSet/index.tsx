/**
 * @file app/shared/components/TabSet/index.tsx
 */

import { NavLink, Outlet, useCatch, useLoaderData } from "@remix-run/react";

// Tab
// -----------------------------------------------------------------------------

type TabProps = {
  // The tab display title.
  title: string,
  // The target link.
  link: string,
  // Current path.
  path: string,
};

export function Tab(props: TabProps) {
  // props.path: "/dashboard/apps/foobar/team"
  // props.link: "team"
  // TODO improve this matching
  const isActive = (props: TabProps) => (props.path.endsWith(props.link));

  // TODO NavLink is more trouble than it's worth since we have to
  // implement similar logic for the tab bodies. Drop it and use our
  // own.

  const getLinkClass = ({ isActive }) => isActive ?
    ["text-indigo-500", "underline", "underline-offset-8",].join(" ") :
    undefined
  ;
  const navLink = <NavLink to={props.link} className={getLinkClass}>{props.title}</NavLink>;

  const contentClass = isActive(props) ?
    ["font-normal", "shadow-xl", "py-2", "md:shadow-none", "md:absolute", "md:left-0", "md:w-full"].join(" ") :
    "hidden"
  ;
  const content = isActive(props) ? <Outlet /> : undefined;

  return (
    <li className="mb-4 md:pr-6">
      {navLink}
      <div className={contentClass}>
      {content}
      </div>
    </li>
  );
};

// TabSet
// -----------------------------------------------------------------------------

type TabSetProps = {
  children: Array<typeof Tab>,
};

export function TabSet(props: TabSetProps) {
  return (
    <nav>
      <ul className="flex flex-col font-bold text-slate-500 md:flex-row md:relative">
      {props.children}
      </ul>
    </nav>
  );
};
