/**
 * @file app/routes/dashboard/apps/index.tsx
 */

import type { Application } from "~/models/app.server";
import type { LoaderFunction } from "@remix-run/cloudflare";

import { getApplicationListItems } from "~/models/app.server";
import { json } from "@remix-run/cloudflare";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { requireJWT } from "~/shared/utilities/session.server";

import AppBox from "~/components/AppBox";
import HeroRow from "~/components/HeroRow";

// Loader
// -----------------------------------------------------------------------------

type LoaderData = {
  apps: Awaited<ReturnType<typeof getApplicationListItems>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request);
  const apps = await getApplicationListItems(jwt);
  return json<LoaderData>({ apps });
};

// Component
// -----------------------------------------------------------------------------

export default function AppsIndexPage() {
  const data = useLoaderData() as LoaderData;
  const apps = data?.apps.length > 0 ? data.apps : [];

  return (
    <div>
      <h3 className="text-2xl font-bold mb-2">Applications</h3>
      <HeroRow />
      <AppBox createLink="/dashboard/new" apps={apps} />
    </div>
  );
}
