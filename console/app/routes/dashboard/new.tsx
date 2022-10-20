/**
 * @file app/routes/dashboard/apps/new/index.tsx
 */

import * as React from "react";

import { Outlet } from "@remix-run/react";

// Component
// -----------------------------------------------------------------------------

export default function NewAppPage() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Create New Application</h3>
      <Outlet />
    </div>
  );
}
