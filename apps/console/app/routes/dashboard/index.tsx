/**
 * @file app/routes/dashboard/index.tsx
 */

import type { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'

import { Link, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/cloudflare'

import folderPlus from '~/images/folderPlus.svg'

import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'

import { getStarbaseClient } from '~/utilities/platform.server'
import type { Application } from '~/models/app.server'
import { getApplicationListItems } from '~/models/app.server'

//import { useUser } from "~/utils";

import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import AppBox from '~/components/AppBox'
import { useState } from 'react'

type LoaderData = {
  apps: Awaited<ReturnType<typeof getApplicationListItems>>
}

export const loader: LoaderFunction = async ({ request }) => {
  //const apps = await getApplicationListItems(jwt);
  const apps = []
  return json<LoaderData>({ apps })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const clientName = formData.get('client_name')

  if (!clientName) throw 'App name is required'

  const starbaseClient = getStarbaseClient()
  const app = await starbaseClient.createApplication(clientName as string)
}

// Component
// -----------------------------------------------------------------------------

export type ContextType = {
  // The list of a user's applications.
  apps: Array<Application>
  // ID of the currently selected application.
  appId: string
}

export default function DashboardIndexPage() {
  const { apps, appId } = useLoaderData<ContextType>()
  const [newAppModalOpen, setNewAppModalOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row min-h-full">
      <SiteMenu apps={apps} selected={appId} />
      <main className="flex flex-col flex-initial min-h-full w-full bg-white">
        <SiteHeader />
        <div className="bg-gray-200 p-6 h-full">
          <AppBox createLink="/dashboard/new" apps={apps} />
          <div className="text-center mt-24 m-auto">
            <img className="inline-block" src={folderPlus} alt="Wallet icon" />
            <div className="text-black mt-4">No Applications</div>
            <p className="text-slate-500">
              Get started by creating an Application.
            </p>
            <Button
              btnSize="l"
              onClick={() => {
                console.log('opening', newAppModalOpen)
                setNewAppModalOpen(true)
              }}
            >
              Create Application"
            </Button>
          </div>
          <Modal
            isOpen={newAppModalOpen}
            fixed
            handleClose={() => setNewAppModalOpen(false)}
          >
            <>
              <h3 className="text-xl font-bold mb-6">New Application</h3>

              <form method="post">
                <p>Application Name</p>
                <input placeholder="My Application" name="client_name"></input>
                <button onClick={() => setNewAppModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Create Application</button>
              </form>
            </>
          </Modal>
        </div>
      </main>
    </div>
  )
}
