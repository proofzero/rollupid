import { json, redirect } from '@remix-run/cloudflare'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import { requireJWT } from '~/utilities/session.server'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { Button, Text } from '@proofzero/design-system'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { RiLoader5Fill } from 'react-icons/ri'
import { useState } from 'react'

import { Popover } from '@headlessui/react'
import SiteMenu from '~/components/SiteMenu'
import SiteHeader from '~/components/SiteHeader'

import { useOutletContext } from '@remix-run/react'

import type { LoaderData as OutletContextData } from '~/root'
import type { ActionFunction } from '@remix-run/cloudflare'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const clientName = formData.get('client_name') as string

  if (!clientName) throw 'App name is required'

  const jwt = await requireJWT(request)

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...generateTraceContextHeaders(context.traceSpan),
  })
  try {
    const { clientId } = await starbaseClient.createApp.mutate({ clientName })
    console.log({ clientId })
    return redirect(`/apps/${clientId}`)
  } catch (error) {
    console.error({ error })
    return json({ error }, { status: 500 })
  }
}

export default function CreateNewApp() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { apps, avatarUrl, PASSPORT_URL, displayName } =
    useOutletContext<OutletContextData>()

  return (
    <Popover className="min-h-screen relative">
      {({ open }) => (
        <div className="flex flex-col relative lg:flex-row min-h-screen bg-gray-50">
          <SiteMenu
            apps={apps}
            open={open}
            PASSPORT_URL={PASSPORT_URL}
            displayName={displayName}
            pfpUrl={avatarUrl}
          />

          <main
            className="flex flex-col
           flex-initial min-h-full w-full"
          >
            <SiteHeader avatarUrl={avatarUrl} />

            <section
              className={`${
                open
                  ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100vh-80px)]\
                    min-h-[636px]'
                  : 'h-full '
              } py-9 sm:mx-11 lg:flex lg:justify-center`}
            >
              <div
                className={`lg:w-[60%] relative rounded-lg px-4 pt-5 pb-4
         text-left transition-all sm:p-6 overflow-y-auto`}
              >
                <Text
                  size="lg"
                  weight="semibold"
                  className="text-gray-900 mb-8"
                >
                  Create Application
                </Text>

                <form method="post" onSubmit={() => setIsSubmitting(true)}>
                  <Input
                    autoFocus
                    id="client_name"
                    label="Application Name"
                    placeholder="My application"
                    required
                    className="mb-12"
                  />

                  <div className="flex justify-end items-center space-x-3">
                    <Button
                      type="submit"
                      btnType="primary-alt"
                      className={
                        isSubmitting
                          ? 'flex items-center justify-between transition'
                          : ''
                      }
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <RiLoader5Fill className="animate-spin" size={22} />
                      )}
                      Create
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          </main>
        </div>
      )}
    </Popover>
  )
}
