/**
 * @file app/routes/dashboard/apps/new/index.tsx
 */

import * as React from 'react'

import { Form } from '@remix-run/react'
import { ActionFunction, redirect } from '@remix-run/cloudflare'

import { makeApplicationId } from '~/models/app.server'

// Action
// -----------------------------------------------------------------------------

export const action: ActionFunction = async ({ request }) => {
  // Generate a random application ID.
  const appId = makeApplicationId()

  // TODO: create empty app DO

  // const app = await initApplication(session, appId)

  // TODO make the redirect URL a parameter
  return redirect(`/apps/${appId}`)
}

// Component
// -----------------------------------------------------------------------------

// StartButton
// -----------------------------------------------------------------------------

type StartButtonProps = {}

const StartButton = (props: StartButtonProps) => {
  return (
    <Form method="post" action=".">
      <button
        type="submit"
        className="grow-0 rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-500 focus:bg-indigo-400"
      >
        Start
      </button>
    </Form>
  )
}

// Component
// -----------------------------------------------------------------------------

export default function NewAppPage() {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Create New Application</h3>
      <div className="flex flex-col md:flex-row justify-between">
        <p>Let's get started creating your application!</p>
        <StartButton />
      </div>
    </div>
  )
}
