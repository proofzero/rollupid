import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
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
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
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
import {
  StripeInvoice,
  createOrUpdateSubscription,
  process3DSecureCard,
} from '~/utils/billing'
import Stripe from 'stripe'
import {
  getEmailDropdownItems,
  getEmailIcon,
} from '@proofzero/utils/getNormalisedConnectedAccounts'
import {
  Dropdown,
  DropdownSelectListItem,
} from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import { redirectToPassport } from '~/utils'
import { HiOutlineMail } from 'react-icons/hi'
import { AccountURN } from '@proofzero/urns/account'
import plans from '@proofzero/utils/billing/plans'

type GroupAppTransferLoaderData = {
  connectedEmails: DropdownSelectListItem[]
  hasPaymentMethod: boolean
  entitlements: GetEntitlementsOutput
  STRIPE_PUBLISHABLE_KEY: string
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

    const [spd, entitlements, connectedAccounts] = await Promise.all([
      await coreClient.billing.getStripePaymentData.query({
        URN: groupURN,
      }),
      await coreClient.billing.getEntitlements.query({
        URN: groupURN,
      }),
      await coreClient.identity.getAccounts.query({
        URN: groupURN,
      }),
    ])

    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    return json<GroupAppTransferLoaderData>({
      connectedEmails,
      hasPaymentMethod: spd && spd.paymentMethodID ? true : false,
      entitlements,
      STRIPE_PUBLISHABLE_KEY: context.env.STRIPE_PUBLISHABLE_KEY,
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

    const emailURN = fd.get('emailURN') as AccountURN | undefined

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const appDetails = await coreClient.starbase.getAppDetails.query({
      clientId: clientID as string,
    })

    if (appDetails.published && !emailURN) {
      throw new BadRequestError({
        message: 'emailURN is required',
      })
    }

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
          planID: context.env.SECRET_STRIPE_PRO_PLAN_ID,
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
        } else {
          let toastSession = await getFlashSession(request, context.env)

          if (
            (sub.latest_invoice as unknown as StripeInvoice)?.payment_intent
              ?.status === 'requires_action'
          ) {
            await coreClient.billing.updateEntitlements.mutate({
              URN: groupURN,
              subscriptionID: sub.id,
              quantity: quantity - 1,
              type: appDetails.appPlan,
            })

            toastSession = await appendToastToFlashSession(
              request,
              {
                message: `Payment requires additional action`,
                type: ToastType.Warning,
              },
              context.env
            )

            let status, client_secret, payment_method
            ;({ status, client_secret, payment_method } = (
              sub.latest_invoice as Stripe.Invoice
            ).payment_intent as Stripe.PaymentIntent)

            return json(
              {
                subId: sub.id,
                status,
                client_secret,
                payment_method,
                clientID,
              },
              {
                headers: {
                  'Set-Cookie': await commitFlashSession(
                    toastSession,
                    context.env
                  ),
                },
              }
            )
          } else {
            toastSession = await appendToastToFlashSession(
              request,
              {
                message: `Payment failed - correct the failed transaction in Billing & Invoicing and retry application transfer`,
                type: ToastType.Error,
              },
              context.env
            )

            return new Response(null, {
              headers: {
                'Set-Cookie': await commitFlashSession(
                  toastSession,
                  context.env
                ),
              },
            })
          }
        }
      }
    }

    try {
      await coreClient.starbase.transferAppToGroup.mutate({
        clientID: clientID as string,
        identityGroupURN: groupURN,
        emailURN,
      })

      const toastSession = await appendToastToFlashSession(
        request,
        {
          message: `Application transferred.`,
          type: ToastType.Success,
        },
        context.env
      )

      return redirect(`/groups/${groupID}`, {
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

      return redirect(`/groups/${params.groupID}/apps/transfer`, {
        headers: {
          'Set-Cookie': await commitFlashSession(toastSession, context.env),
        },
      })
    }
  }
)

export default () => {
  const { group, groupID, groupURN, apps, PASSPORT_URL } =
    useOutletContext<GroupDetailsContextData>()
  const {
    hasPaymentMethod,
    entitlements,
    STRIPE_PUBLISHABLE_KEY,
    connectedEmails,
  } = useLoaderData<GroupAppTransferLoaderData>()

  const actionData = useActionData()

  const [selectedApp, setSelectedApp] = useState<AppLoaderData | null>(null)

  const [needsGroupBilling, setNeedsGroupBilling] = useState(false)
  const [needsEntitlement, setNeedsEntitlement] = useState(false)

  const [selectedEmailURN, setSelectedEmailURN] = useState<AccountURN>()

  const submit = useSubmit()

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
            apps.filter(
              (a) => a.groupID === groupID && a.appPlan === selectedApp.appPlan
            ).length <=
          0
        ) {
          setNeedsEntitlement(true)
        } else {
          setNeedsEntitlement(false)
        }
      }
    }
  }, [selectedApp, entitlements])

  useEffect(() => {
    if (actionData && selectedApp) {
      const { status, client_secret, payment_method, subId } = actionData
      process3DSecureCard({
        submit,
        subId,
        STRIPE_PUBLISHABLE_KEY,
        status,
        client_secret,
        payment_method,
        redirectUrl: `/groups/${groupID}/apps/transfer/`,
        URN: groupURN,
      })
    }
  }, [actionData])

  return (
    <>
      {group && (
        <section className="-mt-4">
          <Breadcrumbs
            trail={[
              {
                label: 'Groups',
                href: '/groups',
              },
              {
                label: group.name,
                href: `/groups/${groupID}`,
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

        <div className="flex flex-row gap-2 items-center mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <g clipPath="url(#clip0_14155_25188)">
              <path
                d="M6.82538 2.63765L1.21071 12.011C1.09503 12.2114 1.03383 12.4387 1.03321 12.6702C1.03258 12.9016 1.09255 13.1292 1.20715 13.3303C1.32175 13.5314 1.48699 13.699 1.68644 13.8164C1.88589 13.9338 2.11261 13.997 2.34404 13.9996H13.574C13.8055 13.997 14.0322 13.9338 14.2316 13.8164C14.4311 13.699 14.5963 13.5314 14.7109 13.3303C14.8255 13.1292 14.8855 12.9016 14.8849 12.6702C14.8843 12.4387 14.8231 12.2114 14.7074 12.011L9.09204 2.63765C8.97381 2.44297 8.80742 2.28204 8.60891 2.17035C8.41041 2.05867 8.18648 2 7.95871 2C7.73094 2 7.50702 2.05867 7.30851 2.17035C7.11001 2.28204 6.94362 2.44297 6.82538 2.63765Z"
                stroke="#6B7280"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V8.66667"
                stroke="#6B7280"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 11.3335H8.006"
                stroke="#6B7280"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_14155_25188">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>

          <Text size="sm" className="text-gray-500">
            Proceed with caution! Once the transfer is completed application
            cannot be transferred back to your personal account.
          </Text>
        </div>
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
              <div className="flex flex-col col-span-2 z-10">
                <Listbox.Button className="relative border rounded-lg py-2 px-3 flex flex-row justify-between items-center flex-1 focus-visible:outline-none focus:border-indigo-500 bg-white disabled:bg-gray-100 px-2 border-gray-300">
                  {apps.filter((a) => !a.groupID).length > 0 && (
                    <>
                      {selectedApp && (
                        <div className="flex flex-row items-center gap-2">
                          {!selectedApp.icon && (
                            <div className="rounded-full w-5 h-5 flex justify-center items-center bg-gray-200 shrink-0 overflow-hidden">
                              <Text size="xs" className="text-gray-500">
                                {selectedApp.name?.substring(0, 1)}
                              </Text>
                            </div>
                          )}
                          {selectedApp.icon && (
                            <img
                              src={selectedApp.icon}
                              className="object-cover w-5 h-5 rounded-full"
                              alt="app icon"
                            />
                          )}
                          <Text
                            size="sm"
                            weight="normal"
                            className="text-gray-800"
                          >
                            {_.upperFirst(selectedApp?.name)}
                          </Text>
                        </div>
                      )}

                      {!selectedApp && (
                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-400"
                        >
                          Select an Application
                        </Text>
                      )}
                    </>
                  )}

                  {apps.filter((a) => !a.groupID).length === 0 && (
                    <Text size="sm" weight="normal" className="text-gray-500">
                      No Application Available
                    </Text>
                  )}

                  {open ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500 shrink-0" />
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
                            <article className="flex flex-row items-center justify-between">
                              <div className="flex flex-row items-center gap-2">
                                {!app.icon && (
                                  <div className="rounded-full w-5 h-5 flex justify-center items-center bg-gray-200 shrink-0 overflow-hidden">
                                    <Text size="xs" className="text-gray-500">
                                      {app.name?.substring(0, 1)}
                                    </Text>
                                  </div>
                                )}
                                {app.icon && (
                                  <img
                                    src={app.icon}
                                    className="object-cover w-5 h-5 rounded-full"
                                    alt="app icon"
                                  />
                                )}
                                <Text
                                  size="sm"
                                  weight="normal"
                                  className="text-gray-800"
                                >
                                  {_.upperFirst(app?.name)}
                                </Text>
                              </div>

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

          {selectedApp?.published && (
            <div className="self-start w-full">
              {connectedEmails && connectedEmails.length === 0 && (
                <Button
                  onClick={() =>
                    redirectToPassport({
                      PASSPORT_URL,
                      login_hint: groupID
                        ? 'email'
                        : 'email microsoft google apple',
                      rollup_action: groupID
                        ? `groupemailconnect_${groupID}`
                        : 'connect',
                    })
                  }
                  btnSize="xs"
                  btnType="secondary-alt"
                  className="w-full"
                >
                  <div className="flex space-x-3 items-center">
                    <HiOutlineMail className="w-6 h-6 text-gray-800" />
                    <Text
                      weight="medium"
                      className="flex-1 text-gray-800 text-left"
                    >
                      Connect Email Account
                    </Text>
                  </div>
                </Button>
              )}

              {connectedEmails && connectedEmails.length > 0 && (
                <>
                  <input
                    name="emailURN"
                    type="hidden"
                    value={selectedEmailURN}
                    required
                  />

                  <Dropdown
                    items={(connectedEmails as DropdownSelectListItem[]).map(
                      (email) => {
                        email.value === ''
                          ? (email.selected = true)
                          : (email.selected = false)
                        email.subtitle && !email.icon
                          ? (email.icon = getEmailIcon(email.subtitle))
                          : null
                        return {
                          value: email.value,
                          selected: email.selected,
                          icon: email.icon,
                          title: email.title,
                        }
                      }
                    )}
                    placeholder="Select an Email Account"
                    ConnectButtonCallback={() =>
                      redirectToPassport({
                        PASSPORT_URL,
                        login_hint: 'email',
                        rollup_action: `groupemailconnect_${groupID}`,
                      })
                    }
                    ConnectButtonPhrase="Connect New Email Address"
                    onSelect={(selected) => {
                      if (!Array.isArray(selected)) {
                        if (!selected || !selected.value) {
                          console.error('Error selecting email, try again')
                          return
                        }

                        setSelectedEmailURN(selected.value as AccountURN)
                      }
                    }}
                  />
                </>
              )}
            </div>
          )}

          <Button
            btnType="primary-alt"
            type="submit"
            className="w-full"
            disabled={
              apps.filter((a) => !a.groupID).length === 0 ||
              needsGroupBilling ||
              !selectedApp ||
              (selectedApp?.published && !selectedEmailURN)
            }
          >
            {!needsEntitlement && `Transfer Application`}
            {needsEntitlement && `Purchase Entitlement & Complete Transfer`}
          </Button>

          {selectedApp && needsEntitlement && (
            <article className="p-4 bg-gray-100 rounded-lg">
              <section className="flex flex-row items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.8333 13.3333H10V10H9.16667M10 6.66667H10.0083M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <Text size="sm" className="text-gray-700">
                  Application you are trying to transfer is on{' '}
                  <Text size="sm" type="span" weight="semibold">
                    Pro Plan
                  </Text>
                  .<br /> There are{' '}
                  <Text size="sm" type="span" weight="semibold">
                    {(entitlements.plans[selectedApp.appPlan]?.entitlements ??
                      0) -
                      apps.filter(
                        (a) =>
                          a.groupID === groupID &&
                          a.appPlan === selectedApp.appPlan
                      ).length}{' '}
                    {plans[selectedApp.appPlan].title} Entitlements
                  </Text>{' '}
                  available in your group.{' '}
                </Text>
              </section>
            </article>
          )}

          {selectedApp && needsGroupBilling && (
            <article className="p-4 bg-orange-50 rounded-lg">
              <section className="mb-3 flex flex-row items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9.9993 7.5V9.16667M9.9993 12.5H10.0076M4.22579 15.8333H15.7728C17.0558 15.8333 17.8577 14.4444 17.2162 13.3333L11.4427 3.33333C10.8012 2.22222 9.19742 2.22222 8.55592 3.33333L2.78242 13.3333C2.14092 14.4444 2.94279 15.8333 4.22579 15.8333Z"
                    stroke="#FB923C"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <Text size="sm" className="text-orange-600">
                  Please add Billing Information
                </Text>
              </section>

              <Text size="sm" className="text-gray-700 mb-3">
                We are missing Billing contact information for the group. <br />
                Please use the link below to add the information.
              </Text>

              <Link to={`/billing/groups/${groupID}`}>
                <Text size="sm" className="text-orange-600">
                  Add Billing Information →
                </Text>
              </Link>
            </article>
          )}
        </Form>
      </section>
    </>
  )
}
