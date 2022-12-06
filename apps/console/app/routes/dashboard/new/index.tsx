/**
 * @file app/routes/dashboard/apps/new/index.tsx
 */

import * as React from 'react'
import { Form, Link, useLoaderData, useLocation } from '@remix-run/react'
import { ActionFunction, LoaderFunction, json } from '@remix-run/cloudflare'

import {
  getUserSession,
  redirectTo,
  requireJWT,
} from '~/shared/utilities/session.server'
import { initApplication, makeApplicationId } from '~/models/app.server'

import {
  WizardFlow,
  WizardStep,
  WizardStepStatus,
} from '~/components/WizardFlow'

// Loader
// -----------------------------------------------------------------------------

type LoaderData = {
  appId: ReturnType<typeof makeApplicationId>
}

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = requireJWT(request)

  // Generate a random application ID.
  const appId = makeApplicationId()

  return json<LoaderData>({ appId })
}

// Action
// -----------------------------------------------------------------------------

export const action: ActionFunction = async ({ request }) => {
  const jwt = requireJWT(request)

  const formData = await request.formData()

  const appId = formData.get('appId')
  // TODO error check

  // Store new application in session.
  const session = await getUserSession(request)
  const app = await initApplication(session, appId)

  // TODO make the redirect URL a parameter
  return redirectTo(`/dashboard/new/${appId}/details`, session)
}

// StartButton
// -----------------------------------------------------------------------------

type StartButtonProps = {
  // An application ID to run the wizard for
  appId: string
}

const StartButton = (props: StartButtonProps) => {
  return (
    <Form method="post" action=".">
      <input type="hidden" name="appId" value={props.appId} />
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
  const data = useLoaderData() as LoaderData
  const appId = data.appId

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between">
        <p>Let's get started creating your application!</p>
        <StartButton appId={appId} />
      </div>
      <WizardFlow>
        <WizardStep
          label="Application Details"
          status={WizardStepStatus.Unfinished}
        />
        <WizardStep
          label="Add Domain(s)"
          status={WizardStepStatus.Unfinished}
        />
        <WizardStep label="Scopes" status={WizardStepStatus.Unfinished} />
        <WizardStep
          label="Collaborators"
          status={WizardStepStatus.Unfinished}
        />
      </WizardFlow>
    </div>
  )
}
