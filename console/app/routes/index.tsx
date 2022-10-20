/**
 * @file app/routes/index.ts
 */

import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

// Component
// -----------------------------------------------------------------------------

export default function Index() {
  return (
    <Link to="/dashboard" className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-50 sm:px-8">
      Go to dashboard
    </Link>
  );
}
