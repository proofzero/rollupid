/**
 * @file app/routes/dashboard/apps.tsx
 */

import { Outlet } from "@remix-run/react";

// Component
// -----------------------------------------------------------------------------

export default function AppsPage() {
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
}
