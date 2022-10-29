/**
 * @file app/routes/dashboard/index.tsx
 */

import { useOutletContext } from "@remix-run/react";

import AppBox from "~/components/AppBox";
import HeroRow from "~/components/HeroRow";
import MetricBox from "~/components/MetricBox";

import type { ContextType } from "../dashboard";

// Component
// -----------------------------------------------------------------------------

export default function DashboardIndexPage() {
  // We get the list of applications in a parent context and pass it down using
  // OutletContext (React Context).
  const { apps, appId } = useOutletContext<ContextType>();

  return (
    <div>
      <h3 className="text-2xl font-bold mb-2">Home</h3>
      <MetricBox />
      <HeroRow />
      <AppBox createLink="/dashboard/new" apps={apps} />
    </div>
  );
}
