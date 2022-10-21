/**
 * @file app/routes/dashboard/apps/$appId/delete.tsx
 */

import invariant from "tiny-invariant";

import { Form, useCatch } from "@remix-run/react";

// Component
// -----------------------------------------------------------------------------

export default function AppDeletePage() {
  const appName = "fixmeApp";
  return (
    <div>
      <h3 className="text-2xl font-bold">Delete Application</h3>
      <p>Are you sure you wish to delete {appName} application?</p>
      <p>This action cannot be undone.</p>
    </div>
  );
}
