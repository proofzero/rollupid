/**
 * @file app/shared/components/DocLink/index.tsx
 */

import { Link } from "@remix-run/react";

import docs from "~/images/docs.svg";

// DocsLink
// -----------------------------------------------------------------------------

type DocsLinkProps = {
  // A documentation link relative to /docs
  link: string,
};

export default function DocsLink (props: DocsLinkProps) {
  const to = `/docs${props.link}`;
  return (
    <Link to={to}>
      <div className="grow-0 grid place-items-center min-w-[38px] w-[38px] min-h-[38px] h-[38px] border border-gray-300 rounded">
        <img src={docs} alt="Docs" className="w-[16px] h-[16px]" />
      </div>
    </Link>
  );
};
