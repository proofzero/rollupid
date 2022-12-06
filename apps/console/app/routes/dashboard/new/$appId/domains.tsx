/**
 * @file routes/dashboard/app/new/domains.tsx
 */

import type { ActionFunction } from '@remix-run/cloudflare'

import * as React from 'react'
import { Form, useActionData, useParams } from '@remix-run/react'
import { json, redirect } from '@remix-run/cloudflare'

import {
  getUserSession,
  redirectTo,
  requireJWT,
} from '~/shared/utilities/session.server'
import { updateApplication } from '~/models/app.server'

import DocsLink from '~/components/DocsLink'
import {
  WizardFlow,
  WizardStep,
  WizardStepStatus,
} from '~/components/WizardFlow'

// Action
// -----------------------------------------------------------------------------

type ActionData = {
  errors?: {
    domains?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const appId = formData.get('appId')
  const next = formData.get('next')
  // TODO error check

  const allDomains = formData.get('domains')
  if (typeof allDomains !== 'string' || allDomains.length === 0) {
    return json<ActionData>(
      { errors: { title: 'Domains are required' } },
      { status: 400 }
    )
  }

  // The user must space-separate the domains they enter.
  const domains = allDomains.split(/\s+/)

  // Update stored application (in session) with additional fields.
  const session = await getUserSession(request)
  const app = await updateApplication(session, appId, {
    domains,
  })

  // TEMP
  console.log(app)

  return redirectTo(next, session)
}

// DomainStep
// -----------------------------------------------------------------------------

type DomainStepProps = {}

const DomainStep = (props: DomainStepProps) => {
  const { appId } = useParams()

  const actionData = useActionData() as ActionData
  const domainRef = React.useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-1 w-full text-gray-500">
      <input type="hidden" name="appId" value={appId} />
      <div className="flex flex-row w-full gap-1">
        <p className="pb-3 grow">
          Doloribus dolores nostrum quia qui natus officia quod et dolorem.
        </p>
        <DocsLink link="/app/domains" />
      </div>
      <label>
        <span className="font-bold">
          Domain(s)<sup>*</sup>
        </span>
        <div className="flex flex-col gap-2">
          <input
            ref={domainRef}
            name="domains"
            className="grow-1 rounded-md border-2 border-indigo-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.domains ? true : undefined}
            aria-errormessage={
              actionData?.errors?.domains ? 'domains-error' : undefined
            }
          />
          <p className="text-gray-400">Inputs are separated with space</p>
        </div>
      </label>
      {actionData?.errors?.domains && (
        <div className="pt-1 text-red-700" id="domains-error">
          {actionData.errors.domains}
        </div>
      )}
    </div>
  )
}

// Component
// -----------------------------------------------------------------------------
// This component defines the "Add Domain(s)" step in the new
// Application Wizard flow.

export default function AddDomainsPage() {
  const { appId } = useParams()
  const back = `/dashboard/new/${appId}/details`
  const next = `/dashboard/new/${appId}/scopes`

  return (
    <WizardFlow>
      <WizardStep
        label="Application Details"
        status={WizardStepStatus.Complete}
      />
      <WizardStep
        label="Add Domain(s)"
        status={WizardStepStatus.Current}
        appId={appId}
        action="."
        back={back}
        next={next}
      >
        <DomainStep />
      </WizardStep>
      <WizardStep label="Scopes" status={WizardStepStatus.Unfinished} />
      <WizardStep label="Collaborators" status={WizardStepStatus.Unfinished} />
    </WizardFlow>
  )
}
