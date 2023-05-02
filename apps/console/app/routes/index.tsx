/**
 * @file app/routes/index.ts
 */

import { Link } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request }) => {
  return redirect('/dashboard')
}

// Component
// -----------------------------------------------------------------------------

export default function Index() {
  return (
    <Link
      to="/dashboard"
      className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-red-700 shadow-sm hover:bg-red-50 sm:px-8"
    >
      Go to dashboard
    </Link>
  )
}
