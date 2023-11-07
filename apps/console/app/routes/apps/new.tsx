import { redirect } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
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

import { Form, NavLink, useOutletContext, useSubmit } from '@remix-run/react'

import type { LoaderData as OutletContextData } from '~/root'
import type { ActionFunction } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import { usePostHog } from 'posthog-js/react'
import classNames from 'classnames'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const formData = await request.formData()
    const clientName = formData.get('client_name') as string

    if (!clientName)
      throw new BadRequestError({ message: 'App name is required' })

    const jwt = await requireJWT(request, context.env)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })
    try {
      const { clientId } = await coreClient.starbase.createApp.mutate({
        clientName,
      })
      return redirect(`/apps/${clientId}`)
    } catch (error) {
      console.error({ error })
      return new InternalServerError({
        message: 'Could not create the application',
      })
    }
  }
)

export default function CreateNewApp() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const posthog = usePostHog()

  const {
    apps,
    avatarUrl,
    PASSPORT_URL,
    displayName,
    paymentFailedIdentityGroups,
  } = useOutletContext<
    OutletContextData & {
      paymentFailedIdentityGroups: IdentityGroupURN[]
    }
  >()

  const submit = useSubmit()

  return (
    <Popover className="min-h-[100dvh] relative">
      {({ open }) => (
        <div className="flex flex-col relative lg:flex-row min-h-[100dvh] bg-gray-50">
          <SiteMenu
            apps={apps}
            open={open}
            PASSPORT_URL={PASSPORT_URL}
            displayName={displayName}
            pfpUrl={avatarUrl}
            paymentFailedIdentityGroups={paymentFailedIdentityGroups}
          />

          <main
            className="flex flex-col
           flex-initial min-h-full w-full"
          >
            <SiteHeader
              avatarUrl={avatarUrl}
              passportURL={PASSPORT_URL}
              displayName={displayName}
              submit={submit}
              posthog={posthog}
            />

            <section
              className={`${
                open
                  ? 'max-lg:opacity-50\
                    max-lg:overflow-hidden\
                    max-lg:h-[calc(100dvh-80px)]\
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

                <Form
                  className="flex flex-col gap-4 w-[464px]"
                  method="post"
                  onSubmit={() => setIsSubmitting(true)}
                >
                  <Input
                    autoFocus
                    id="client_name"
                    label="Application Name"
                    placeholder="My application"
                    required
                  />

                  <Button
                    type="submit"
                    btnType="primary-alt"
                    className={classNames(
                      'w-full',
                      isSubmitting
                        ? 'flex items-center justify-between transition'
                        : ''
                    )}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <RiLoader5Fill className="animate-spin" size={22} />
                    )}
                    Create
                  </Button>
                </Form>

                <Text className="mt-4" size="sm">
                  Did you want to create this application within a group?{' '}
                  <NavLink to="/groups" className="text-[#6366F1]">
                    Go to Groups
                  </NavLink>
                </Text>
              </div>
            </section>
          </main>
        </div>
      )}
    </Popover>
  )
}
