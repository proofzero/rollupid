/**
 * @file app/routes/dapps/$appId.tsx
 */

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import invariant from 'tiny-invariant'

import { json, redirect } from '@remix-run/cloudflare'
import {
  Outlet,
  useCatch,
  useLoaderData,
  useLocation,
  useParams,
} from '@remix-run/react'

import type { Application } from '~/models/app.server'
import { deleteApplication, getApplication } from '~/models/app.server'
import { requireJWT } from '~/utilities/session.server'

// Loader
// -----------------------------------------------------------------------------

type LoaderData = {
  app: NonNullable<Awaited<ReturnType<typeof getApplication>>>
}

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.appId, 'appId not found')

  const jwt = await requireJWT(request /*, "/auth"*/)
  const cookie = request.headers.get('Cookie')

  const app = await getApplication(jwt, params.appId, cookie)
  if (!app) {
    throw new Response('Not Found', { status: 404 })
  }
  return json<LoaderData>({ app })
}

// Action
// -----------------------------------------------------------------------------

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.appId, 'appId not found')

  const jwt = await requireJWT(request)

  await deleteApplication({ jwt, appId: params.appId })

  return redirect('/dashboard/apps')
}

// Component
// -----------------------------------------------------------------------------

export type ContextType = {
  app: Application
}

export default function AppDetailsPage() {
  const data = useLoaderData() as LoaderData
  const app = data?.app !== undefined ? data.app : {}

  return (
    <div className="h-full">
      <Outlet context={{ app }} />
    </div>
  )
}

// Errors
// -----------------------------------------------------------------------------

export function ErrorBoundary({ error }: { error: Error }) {
  console.error({ error })

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const { appId } = useParams()
  const caught = useCatch()

  if (caught.status === 404) {
    return <div>Application "{appId}" not found</div>
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}
