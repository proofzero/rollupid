/**
 * @file routes/dashboard/app/new/details.tsx
 */

import invariant from 'tiny-invariant'

import * as React from 'react'

import { Form, useActionData, useParams } from '@remix-run/react'

import type { ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import {
  getUserSession,
  redirectTo,
  requireJWT,
} from '~/shared/utilities/session.server'
import { uploadIcon } from '~/shared/utilities/icon.server'
import { updateApplication, APP_NAME_MAX_LENGTH } from '~/models/app.server'

import type { ImageMetadata } from '~/shared/utilities/icon.server'

import DocsLink from '~/components/DocsLink'
import IconPicker from '~/components/IconPicker'
import {
  WizardFlow,
  WizardStep,
  WizardStepStatus,
} from '~/components/WizardFlow'

// Action
// -----------------------------------------------------------------------------

type ActionData = {
  errors?: {
    name?: string
    icon?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const formData = await request.formData()

  const appId = formData.get('appId')
  const next = formData.get('next')
  // TODO error check

  const name = formData.get('name')
  if (typeof name !== 'string' || name.length === 0) {
    return json<ActionData>(
      { errors: { name: 'Name is required' } },
      { status: 400 }
    )
  }

  // Allowed image upload formats
  // TODO move to constants
  const imageFormats = new Set(['image/png', 'image/jpeg'])

  const iconBlob = formData.get('icon')

  if (!(iconBlob instanceof Blob) || iconBlob.size === 0) {
    return json<ActionData>(
      { errors: { icon: 'Icon is required' } },
      { status: 400 }
    )
  }
  if (!imageFormats.has(iconBlob.type)) {
    return json<ActionData>(
      { errors: { icon: `${iconBlob.type} is unsupported` } },
      { status: 400 }
    )
  }

  // Decorate image with metadata indicating origin server, etc.
  const metadata: ImageMetadata = {
    env: DEPLOY_ENV,
  }

  const { id, imageURL } = await uploadIcon(iconBlob, appId, metadata)
  if (imageURL === undefined) {
    return json<ActionData>(
      { errors: { icon: 'Icon upload failed' } },
      { status: 500 }
    )
  }

  // Update stored application (in session) with additional fields.
  const session = await getUserSession(request)
  const app = await updateApplication(session, appId, {
    name,
    icon: imageURL,
  })

  // TEMP
  console.log(app)

  return redirectTo(next, session)
}

// DetailsStep
// -----------------------------------------------------------------------------

type DetailsStepProp = {}

const DetailsStep = (props: DetailsStepProp) => {
  const { appId } = useParams()

  const actionData = useActionData() as ActionData
  const nameRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus()
    }
  }, [actionData])

  return (
    <div className="flex flex-col gap-1 w-full text-gray-500">
      <input type="hidden" name="appId" value={appId} />
      <div className="flex flex-row w-full">
        <div className="grow">
          <IconPicker
            invalid={actionData?.errors?.icon ? true : undefined}
            errorMessage={actionData?.errors?.icon}
          />
        </div>
        <DocsLink link="/app/details" />
      </div>
      <label>
        <span className="font-bold">
          Name your Application<sup>*</sup>
        </span>
        <div className="flex flex-col md:flex-row">
          <input
            ref={nameRef}
            name="name"
            className="grow-1 rounded-md border-2 border-indigo-500 px-3 text-lg leading-loose"
            maxLength={APP_NAME_MAX_LENGTH}
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-errormessage={
              actionData?.errors?.name ? 'name-error' : undefined
            }
          />
        </div>
      </label>
      {actionData?.errors?.name && (
        <div className="pt-1 text-red-700" id="name-error">
          {actionData.errors.name}
        </div>
      )}
    </div>
  )
}

// Component
// -----------------------------------------------------------------------------
// This component defines the "Application Details" step in the new
// Application Wizard flow.

export default function AppDetailsPage() {
  const { appId } = useParams()
  const next = `/dashboard/new/${appId}/domains`

  return (
    <WizardFlow>
      <WizardStep
        label="Application Details"
        status={WizardStepStatus.Current}
        appId={appId}
        action="."
        next={next}
      >
        <DetailsStep />
      </WizardStep>
      <WizardStep label="Add Domain(s)" status={WizardStepStatus.Unfinished} />
      <WizardStep label="Scopes" status={WizardStepStatus.Unfinished} />
      <WizardStep label="Collaborators" status={WizardStepStatus.Unfinished} />
    </WizardFlow>
  )
}
