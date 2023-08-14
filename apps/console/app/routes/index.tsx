/**
 * @file app/routes/index.ts
 */

import { Link } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request }) => {
  // The story here is slightly different from the one in passport.
  // Since it's redirecting to passport from root if there's no JWT -- it looks for Meta function in root.
  // This's why we don't use meta function in this file.
  if (
    request.cf.botManagement.score > 30 ||
    ['localhost', '127.0.0.1'].includes(new URL(request.url).hostname)
  ) {
    return redirect('/dashboard')
  } else return null
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
