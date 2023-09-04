import { Form, Link, useLoaderData, useOutletContext } from '@remix-run/react'
import { GroupDetailsContextData } from '../$groupID'
import Breadcrumbs from '@proofzero/design-system/src/atoms/breadcrumbs/Breadcrumbs'
import { Text } from '@proofzero/design-system'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import {
  ActionFunction,
  LoaderFunction,
  json,
  redirect,
} from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import { BadRequestError } from '@proofzero/errors'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { Listbox, Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'
import { AppLoaderData } from '~/root'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid'
import classNames from 'classnames'
import _ from 'lodash'
import { ServicePlanType } from '@proofzero/types/billing'
import { GetEntitlementsOutput } from '@proofzero/platform.billing/src/jsonrpc/methods/getEntitlements'
import { createOrUpdateSubscription } from '~/utils/billing'
import Stripe from 'stripe'

type GroupAppTransferLoaderData = {
  hasPaymentMethod: boolean
  entitlements: GetEntitlementsOutput
}

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const jwt = await requireJWT(request, context.env)
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const groupURN = IdentityGroupURNSpace.urn(
      params.groupID as string
    ) as IdentityGroupURN

    const spd = await coreClient.billing.getStripePaymentData.query({
      URN: groupURN,
    })

    const entitlements = await coreClient.billing.getEntitlements.query({
      URN: groupURN,
    })

    return json<GroupAppTransferLoaderData>({
      hasPaymentMethod: spd && spd.paymentMethodID ? true : false,
      entitlements,
    })
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const groupID = params.groupID as string
    const groupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const jwt = await requireJWT(request, context.env)

    const fd = await request.formData()
    const clientID = fd.get('app[clientId]')
    if (!clientID) {
      throw new BadRequestError({
        message: 'app[clientId] is required',
      })
    }

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const appDetails = await coreClient.starbase.getAppDetails.query({
      clientId: clientID as string,
    })

    if (appDetails.appPlan !== ServicePlanType.FREE) {
      const spd = await coreClient.billing.getStripePaymentData.query({
        URN: groupURN,
      })
      if (!spd.paymentMethodID) {
        throw new BadRequestError({
          message: 'Group has no payment method configured',
        })
      }

      const entitlements = await coreClient.billing.getEntitlements.query({
        URN: groupURN,
      })

      const groupApps = await coreClient.starbase.listGroupApps.query()
      const currentGroupApps = groupApps.filter((a) => a.groupURN === groupURN)
      const currentGroupPlanApps = currentGroupApps.filter(
        (a) => a.appPlan === appDetails.appPlan
      )

      if (
        (entitlements.plans[appDetails.appPlan]?.entitlements ?? 0) -
          currentGroupPlanApps.length <=
        0
      ) {
        const quantity = entitlements.subscriptionID
          ? entitlements.plans[appDetails.appPlan]?.entitlements
            ? entitlements.plans[appDetails.appPlan]?.entitlements! + 1
            : 1
          : 1

        const sub = await createOrUpdateSubscription({
          customerID: spd.customerID,
          SECRET_STRIPE_PRO_PLAN_ID: context.env.SECRET_STRIPE_PRO_PLAN_ID,
          SECRET_STRIPE_API_KEY: context.env.SECRET_STRIPE_API_KEY,
          quantity,
          subscriptionID: entitlements.subscriptionID,
          URN: groupURN,
        })

        const invoiceStatus = (sub.latest_invoice as Stripe.Invoice)?.status

        if (
          (sub.status === 'active' || sub.status === 'trialing') &&
          invoiceStatus === 'paid'
        ) {
          await coreClient.billing.updateEntitlements.mutate({
            URN: groupURN,
            subscriptionID: sub.id,
            quantity: quantity,
            type: appDetails.appPlan,
          })
        }
      }
    }

    try {
      await coreClient.starbase.transferAppToGroup.mutate({
        clientID: clientID as string,
        identityGroupURN: groupURN,
      })

      const toastSession = await appendToastToFlashSession(
        request,
        {
          message: `Application transferred successfully.`,
          type: ToastType.Success,
        },
        context.env
      )

      return redirect(`/apps/${clientID}`, {
        headers: {
          'Set-Cookie': await commitFlashSession(toastSession, context.env),
        },
      })
    } catch (ex) {
      const toastSession = await appendToastToFlashSession(
        request,
        {
          message: `There was an issue transferring the application. Please try again.`,
          type: ToastType.Error,
        },
        context.env
      )

      return redirect(`/spuorg/${params.groupID}/apps/new`, {
        headers: {
          'Set-Cookie': await commitFlashSession(toastSession, context.env),
        },
      })
    }
  }
)

export default () => {
  const { group, groupID, apps } = useOutletContext<GroupDetailsContextData>()
  const { hasPaymentMethod, entitlements } =
    useLoaderData<GroupAppTransferLoaderData>()

  const [selectedApp, setSelectedApp] = useState<AppLoaderData | undefined>(
    undefined
  )

  const [needsGroupBilling, setNeedsGroupBilling] = useState(false)
  const [needsEntitlement, setNeedsEntitlement] = useState(false)

  useEffect(() => {
    if (!selectedApp) {
      setNeedsEntitlement(false)
      setNeedsGroupBilling(false)
      return
    }

    if (selectedApp.appPlan !== ServicePlanType.FREE) {
      if (!hasPaymentMethod) {
        setNeedsGroupBilling(true)
      } else {
        if (
          (entitlements.plans[selectedApp.appPlan]?.entitlements ?? 0) -
            apps.filter((a) => a.groupID === groupID).length <=
          0
        ) {
          setNeedsEntitlement(true)
        }
      }
    }
  }, [selectedApp])

  return (
    <>
      {group && (
        <section className="-mt-4">
          <Breadcrumbs
            trail={[
              {
                label: 'Groups',
                href: '/spuorg',
              },
              {
                label: group.name,
                href: `/spuorg/${groupID}`,
              },
              {
                label: 'Transfer Application',
              },
            ]}
            LinkType={Link}
          />
        </section>
      )}

      <section className="mb-[87px]">
        <Text size="2xl" weight="semibold">
          Transfer Application
        </Text>
      </section>

      <section className="flex justify-center items-center">
        <Form className="flex flex-col gap-4 w-[464px]" method="post">
          <Input
            id="group_name"
            label="Group"
            readOnly
            disabled
            value={group.name}
          />

          <Listbox
            value={selectedApp}
            onChange={setSelectedApp}
            name="app"
            disabled={apps.filter((a) => !a.groupID).length === 0}
          >
            {({ open }) => (
              <div className="flex flex-col col-span-2">
                <Listbox.Button className="relative border rounded-l p-2 flex flex-row justify-between items-center flex-1 focus-visible:outline-none focus:border-indigo-500">
                  <div className="flex flex-row items-center gap-2">
                    {selectedApp?.icon && (
                      <img className="w-5 h-5" src={selectedApp.icon} />
                    )}
                    <Text size="sm" weight="normal" className="text-gray-800">
                      {_.upperFirst(selectedApp?.name)}
                    </Text>
                  </div>

                  {open ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  )}
                </Listbox.Button>

                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Listbox.Options
                    className="absolute bg-white p-2 flex flex-col gap-2 mt-1 focus-visible:ring-0 focus-visible:outline-none border shadow w-full"
                    static
                  >
                    {apps
                      .filter((a) => !a.groupID)
                      .map((app) => (
                        <Listbox.Option
                          key={app.clientId}
                          value={app}
                          className={({ active }) =>
                            classNames(
                              'flex flex-row items-center gap-2 hover:bg-gray-100 py-2 px-4 rounded-lg cursor-pointer',
                              {
                                'bg-gray-100': active,
                              }
                            )
                          }
                        >
                          {({ selected }) => (
                            <article className="flex flex-row justify-between items-center">
                              <section>
                                {app.icon && (
                                  <img className="w-5 h-5" src={app.icon} />
                                )}
                                <Text
                                  size="sm"
                                  weight="normal"
                                  className="text-gray-800"
                                >
                                  {_.upperFirst(app.name)}
                                </Text>
                              </section>
                              {selected && (
                                <CheckIcon
                                  className="h-5 w-5 text-indigo-600"
                                  aria-hidden="true"
                                />
                              )}
                            </article>
                          )}
                        </Listbox.Option>
                      ))}
                  </Listbox.Options>
                </Transition>
              </div>
            )}
          </Listbox>

          <Button
            btnType="primary-alt"
            type="submit"
            className="w-full"
            disabled={
              apps.filter((a) => !a.groupID).length === 0 ||
              needsGroupBilling ||
              !selectedApp
            }
          >
            {!needsEntitlement && `Transfer Application`}
            {needsEntitlement && `Purchase Entitlement & Complete Transfer`}
          </Button>
        </Form>
      </section>

      {needsGroupBilling && <section>PLEASE ADD BILLING INFORMATION</section>}
      {needsEntitlement && <section>PLEASE ADD ENTITLEMENT</section>}
    </>
  )
}
