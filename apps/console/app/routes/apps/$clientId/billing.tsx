import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import plans, { type PlanDetails } from '~/routes/__layout/billing/plans'
import { PlanFeatures } from '~/routes/__layout/billing'
import { type PaymentData, ServicePlanType } from '@proofzero/types/account'
import { Button } from '@proofzero/design-system'
import { StatusPill } from '@proofzero/design-system/src/atoms/pills/StatusPill'
import {
  type ActionFunction,
  type LoaderFunction,
  type Session,
  type SessionData,
  json,
} from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createCoreClient from '@proofzero/platform-clients/core'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import {
  useActionData,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
import { type GetEntitlementsOutput } from '@proofzero/platform/account/src/jsonrpc/methods/getEntitlements'
import { type AccountURN } from '@proofzero/urns/account'
import { BadRequestError } from '@proofzero/errors'
import type { ToastNotification, appDetailsProps } from '~/types'
import { type AppLoaderData } from '~/root'

import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { useEffect, useMemo, useState } from 'react'
import { HiArrowUp, HiOutlineShoppingCart } from 'react-icons/hi'
import {
  ToastType,
  Toaster,
  toast,
} from '@proofzero/design-system/src/atoms/toast'
import dangerVector from '~/images/danger.svg'
import { type Env } from 'bindings'
import {
  getCurrentAndUpcomingInvoices,
  createOrUpdateSubscription,
  process3DSecureCard,
  UnpaidInvoiceNotification,
} from '~/utils/billing'
import { setPurchaseToastNotification } from '~/utils'
import type Stripe from 'stripe'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const entitlements = await coreClient.account.getEntitlements.query({
      accountURN,
    })
    const paymentData = await coreClient.account.getStripePaymentData.query({
      accountURN,
    })

    const flashSession = await getFlashSession(request, context.env)
    let toastNotification: ToastNotification | undefined = undefined
    const toastStr = flashSession.get('toast_notification')
    if (toastStr) {
      toastNotification = JSON.parse(toastStr)
    }

    return json(
      {
        entitlements,
        paymentData,
        toastNotification,
        STRIPE_PUBLISHABLE_KEY: context.env.STRIPE_PUBLISHABLE_KEY,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession, context.env),
        },
      }
    )
  }
)

const processUpdateOp = async (
  jwt: string,
  plan: ServicePlanType,
  clientId: string,
  flashSession: Session<SessionData, SessionData>,
  env: Env,
  traceHeader: Record<'traceparent', string>
) => {
  const parsedJwt = parseJwt(jwt)
  const accountURN = parsedJwt.sub as AccountURN

  const coreClient = createCoreClient(env.Core, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const entitlements = await coreClient.account.getEntitlements.query({
    accountURN,
  })

  const apps = await coreClient.starbase.listApps.query()
  const allotedApps = apps.filter((a) => a.appPlan === plan).length

  if (
    plan !== ServicePlanType.FREE &&
    allotedApps >= (entitlements.plans[plan]?.entitlements ?? 0)
  ) {
    throw new BadRequestError({
      message: `You have reached the maximum number of apps for this plan`,
    })
  }

  await coreClient.starbase.setAppPlan.mutate({
    accountURN,
    clientId,
    plan,
  })

  if (plan === ServicePlanType.FREE) {
    const appDetails = apps.find((a) => a.clientId === clientId)
    if (!appDetails) {
      throw new BadRequestError({
        message: `App not found`,
      })
    }

    if (appDetails.customDomain) {
      await coreClient.starbase.deleteCustomDomain.mutate({
        clientId,
      })
    }
  }
  flashSession.flash(
    'toast_notification',
    JSON.stringify({
      type: ToastType.Success,
      message: `${plans[plan].title} assigned.`,
    })
  )
}

const processPurchaseOp = async (
  jwt: string,
  plan: ServicePlanType,
  clientId: string,
  flashSession: any,
  env: Env,
  traceHeader: Record<'traceparent', string>
) => {
  const parsedJwt = parseJwt(jwt)
  const accountURN = parsedJwt.sub as AccountURN

  const coreClient = createCoreClient(env.Core, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const entitlements = await coreClient.account.getEntitlements.query({
    accountURN,
  })

  const paymentData = await coreClient.account.getStripePaymentData.query({
    accountURN,
  })
  if (!paymentData || !paymentData.customerID) {
    throw new BadRequestError({
      message: `You must add a payment method before purchasing a plan`,
    })
  }

  const { customerID } = paymentData
  const quantity = entitlements.subscriptionID
    ? entitlements.plans[plan]?.entitlements
      ? entitlements.plans[plan]?.entitlements! + 1
      : 1
    : 1

  const sub = await createOrUpdateSubscription({
    customerID,
    SECRET_STRIPE_PRO_PLAN_ID: env.SECRET_STRIPE_PRO_PLAN_ID,
    SECRET_STRIPE_API_KEY: env.SECRET_STRIPE_API_KEY,
    quantity,
    subscriptionID: entitlements.subscriptionID,
    accountURN,
    coreClient,
    spd: paymentData,
  })

  setPurchaseToastNotification({
    sub,
    flashSession,
  })
  if (sub.status === 'active' || sub.status === 'trialing') {
    await coreClient.account.updateEntitlements.mutate({
      accountURN: accountURN,
      subscriptionID: sub.id,
      quantity: quantity,
      type: plan,
    })

    await coreClient.starbase.setAppPlan.mutate({
      accountURN,
      clientId,
      plan,
    })
  }

  return sub
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request, context.env)
    if (!jwt) {
      throw new BadRequestError({
        message: 'Missing JWT',
      })
    }

    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const { clientId } = params
    if (!clientId) throw new BadRequestError({ message: 'Missing Client ID' })

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const spd = await coreClient.account.getStripePaymentData.query({
      accountURN,
    })

    const invoices = await getCurrentAndUpcomingInvoices(
      spd,
      context.env.SECRET_STRIPE_API_KEY
    )

    const flashSession = await getFlashSession(request, context.env)

    await UnpaidInvoiceNotification({
      invoices,
      flashSession,
      env: context.env,
    })

    const fd = await request.formData()
    const op = fd.get('op') as 'update' | 'purchase'
    const { plan } = JSON.parse(fd.get('payload') as string) as {
      plan: ServicePlanType
    }

    switch (op) {
      case 'update': {
        await processUpdateOp(
          jwt,
          plan,
          clientId,
          flashSession,
          context.env,
          traceHeader
        )
        break
      }

      case 'purchase': {
        const sub = await processPurchaseOp(
          jwt,
          plan,
          clientId,
          flashSession,
          context.env,
          traceHeader
        )

        let status, client_secret, payment_method
        if (
          sub.latest_invoice &&
          (sub.latest_invoice as Stripe.Invoice).payment_intent
        ) {
          // lots of stripe type casting since by default many
          // props are strings (not expanded versions)
          ;({ status, client_secret, payment_method } = (
            sub.latest_invoice as Stripe.Invoice
          ).payment_intent as Stripe.PaymentIntent)
        }

        return json(
          {
            subId: sub.id,
            status,
            client_secret,
            payment_method,
          },
          {
            headers: {
              'Set-Cookie': await commitFlashSession(flashSession, context.env),
            },
          }
        )
      }
    }

    return new Response(null, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession, context.env),
      },
    })
  }
)

const getAvailableEntitlements = (entitlement: {
  planType: ServicePlanType
  totalEntitlements?: number
  usedEntitlements?: number
}) => (entitlement.totalEntitlements ?? 0) - (entitlement.usedEntitlements ?? 0)

const PlanCard = ({
  planType,
  currentPlan,
  totalEntitlements,
  usedEntitlements,
  paymentData,
  featuresColor,
  hasUnpaidInvoices,
}: {
  planType: ServicePlanType
  currentPlan: ServicePlanType
  totalEntitlements?: number
  usedEntitlements?: number
  paymentData: PaymentData
  featuresColor: 'text-gray-500' | 'text-indigo-500'
  hasUnpaidInvoices: boolean
}) => {
  const plan = plans[planType]
  const active = planType === currentPlan

  const availableEntitlements = useMemo(() => {
    return getAvailableEntitlements({
      planType,
      totalEntitlements,
      usedEntitlements,
    })
  }, [planType, totalEntitlements, usedEntitlements])

  return (
    <>
      <article className="bg-white rounded border">
        <header className="flex flex-col lg:flex-row justify-between lg:items-center p-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Text size="lg" weight="semibold" className="text-gray-900">
                {plan.title}
              </Text>

              {active && <StatusPill status="success" text="Active" />}
            </div>

            <Text size="sm" weight="medium" className="text-[#6B7280]">
              {plan.description}
            </Text>
          </div>

          {!active && (
            <EntitlementsCardButton
              hasUnpaidInvoices={hasUnpaidInvoices}
              currentPlan={currentPlan}
              entitlement={{
                planType,
                totalEntitlements,
                usedEntitlements,
              }}
              paymentData={paymentData}
            />
          )}
        </header>
        <div className="w-full border-b border-gray-200"></div>
        <main>
          <div className="flex flex-row gap-7 p-4">
            <PlanFeatures plan={plan} featuresColor={featuresColor} />
          </div>
        </main>
        <div className="w-full border-t border-gray-200"></div>
        <footer className="p-4 flex flex-row items-center justify-between">
          <Text>${plan.price} per month</Text>
          <Text size="sm" weight="medium" className="text-gray-500">
            {!active &&
              planType !== ServicePlanType.FREE &&
              availableEntitlements !== 0 &&
              `${availableEntitlements} Entitlement(s) available`}
          </Text>
        </footer>
      </article>
    </>
  )
}

const PurchaseConfirmationModal = ({
  isOpen,
  setIsOpen,
  plan,
  paymentData,
  hasUnpaidInvoices,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  plan: PlanDetails
  paymentData?: PaymentData
  hasUnpaidInvoices: boolean
}) => {
  const submit = useSubmit()

  return (
    <Modal isOpen={isOpen} fixed handleClose={() => setIsOpen(false)}>
      <Text
        size="lg"
        weight="semibold"
        className="text-left text-gray-800 mx-5"
      >
        Purchase Entitlement(s)
      </Text>

      {!paymentData?.customerID && (
        <section className="mt-3.5 mx-5">
          <ToastWithLink
            message="Please add Billing Information in Billing & Invoicing section"
            linkHref={`/billing/`}
            linkText="Add Billing Information"
          />
        </section>
      )}

      {paymentData?.customerID && !paymentData.paymentMethodID && (
        <section className="mt-3.5 mx-5">
          <ToastWithLink
            message="Update your Payment Information to enable purchasing"
            linkHref={`/billing/payment`}
            linkText="Update payment information"
          />
        </section>
      )}

      <section className="m-5 border rounded-lg overflow-auto thin-scrollbar">
        <div className="p-6">
          <Text size="lg" weight="semibold" className="text-gray-900 text-left">
            {plan.title}
          </Text>

          <Text
            size="sm"
            weight="medium"
            className="text-[#6B7280] text-left mb-6"
          >
            {plan.description}
          </Text>

          <PlanFeatures plan={plan} featuresColor="text-indigo-500" />
        </div>

        <div className="border-b border-gray-200"></div>

        <div className="p-6 flex justify-between items-center">
          <div>
            <Text size="sm" weight="medium" className="text-gray-800 text-left">
              Number of Entitlements
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="text-[#6B7280] text-left"
            >
              1 x ${plan.price}/month
            </Text>
          </div>
        </div>

        <div className="border-b border-gray-200"></div>

        <div className="p-6 flex justify-between items-center">
          <Text size="sm" weight="medium" className="text-gray-800 text-left">
            Changes to your subscription
          </Text>

          <div className="flex flex-row gap-2 items-center">
            <Text
              size="lg"
              weight="semibold"
              className="text-gray-900"
            >{`+$${plan.price}`}</Text>
            <Text size="sm" weight="medium" className="text-gray-500">
              per month
            </Text>
          </div>
        </div>
      </section>

      <div className="flex-1"></div>

      <section className="flex flex-row-reverse gap-4 m-5 mt-auto">
        <Button
          btnType="primary-alt"
          disabled={!paymentData?.paymentMethodID || hasUnpaidInvoices}
          onClick={() => {
            setIsOpen(false)

            submit(
              {
                op: 'purchase',
                payload: JSON.stringify({
                  plan: ServicePlanType.PRO,
                }),
              },
              {
                method: 'post',
              }
            )
          }}
        >
          Purchase
        </Button>
        <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </section>
    </Modal>
  )
}

const DowngradeConfirmationModal = ({
  isOpen,
  setIsOpen,
  currentPlan,
  updatedPlan,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  currentPlan: ServicePlanType
  updatedPlan: ServicePlanType
}) => {
  const submit = useSubmit()

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`w-[48vw] rounded-lg bg-white px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col gap-4 text-left`}
      >
        <div className="flex flex-row gap-4 items-start">
          <img src={dangerVector} />

          <div className="flex-1 flex flex-col gap-4">
            <Text size="lg" weight="medium" className="text-gray-900 mb-2">
              Downgrade Application
            </Text>

            <Text>
              You are about to downgrade the application to the{' '}
              {plans[updatedPlan].title}, removing the following features:
            </Text>

            <ul className="list-disc">
              {plans[currentPlan].features
                .filter((f) => f.type === 'addon')
                .map((f) => (
                  <li>{f.title}</li>
                ))}
            </ul>

            <Text>Are you sure you want to proceed?</Text>
          </div>
        </div>

        <div className="flex justify-end items-center space-x-3">
          <Button btnType="secondary-alt" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            btnType="dangerous"
            onClick={() => {
              submit(
                {
                  op: 'update',
                  payload: JSON.stringify({
                    plan: updatedPlan,
                  }),
                },
                {
                  method: 'post',
                }
              )
            }}
          >
            Downgrade
          </Button>
        </div>
      </div>
    </Modal>
  )
}

const EntitlementsCardButton = ({
  currentPlan,
  entitlement,
  paymentData,
  hasUnpaidInvoices,
}: {
  currentPlan: ServicePlanType
  entitlement: {
    planType: ServicePlanType
    totalEntitlements?: number
    usedEntitlements?: number
  }
  hasUnpaidInvoices: boolean
  paymentData: PaymentData
}) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showDowngradeConfirmationModal, setShowDowngradeConfirmationModal] =
    useState(false)

  const isUpgrade = (
    planType: ServicePlanType,
    currentPlanType: ServicePlanType
  ) => {
    const typeImportance = [ServicePlanType.FREE, ServicePlanType.PRO]
    return !(
      typeImportance.findIndex((ty) => ty === planType) <
      typeImportance.findIndex((ty) => ty === currentPlanType)
    )
  }

  const upgrade = isUpgrade(entitlement.planType, currentPlan)
  const op =
    entitlement.planType === ServicePlanType.FREE ||
    getAvailableEntitlements(entitlement) > 0
      ? 'update'
      : 'purchase'

  const submit = useSubmit()

  return (
    <>
      <PurchaseConfirmationModal
        hasUnpaidInvoices={hasUnpaidInvoices}
        isOpen={showPurchaseModal}
        setIsOpen={setShowPurchaseModal}
        plan={plans[entitlement.planType]}
        paymentData={paymentData}
      />

      <DowngradeConfirmationModal
        isOpen={showDowngradeConfirmationModal}
        setIsOpen={setShowDowngradeConfirmationModal}
        currentPlan={currentPlan}
        updatedPlan={ServicePlanType.FREE}
      />

      <Button
        btnType={upgrade ? 'primary-alt' : 'secondary-alt'}
        onClick={() => {
          if (op === 'update') {
            if (upgrade) {
              submit(
                {
                  op: 'update',
                  payload: JSON.stringify({
                    plan: entitlement.planType,
                  }),
                },
                {
                  method: 'post',
                }
              )
            } else {
              setShowDowngradeConfirmationModal(true)
            }
          } else {
            setShowPurchaseModal(true)
          }
        }}
      >
        {op === 'update' ? (
          <>
            {upgrade ? (
              <span className="flex flex-row gap-2 items-center">
                <HiArrowUp /> Upgrade to{' '}
                {plans[entitlement.planType].title.split(' ')[0]}
              </span>
            ) : (
              <>
                Downgrade to {plans[entitlement.planType].title.split(' ')[0]}
              </>
            )}
          </>
        ) : (
          <span className="flex flex-row gap-2 items-center">
            <HiOutlineShoppingCart className="w-4 h-4" /> Purchase
          </span>
        )}
      </Button>
    </>
  )
}

export default () => {
  const {
    entitlements: { plans: entitlements },
    paymentData,
    toastNotification,
    STRIPE_PUBLISHABLE_KEY,
  } = useLoaderData<{
    STRIPE_PUBLISHABLE_KEY: string
    entitlements: GetEntitlementsOutput
    paymentData: PaymentData
    toastNotification: ToastNotification | undefined
  }>()

  const actionData = useActionData()
  const { apps, appDetails, hasUnpaidInvoices } = useOutletContext<{
    apps: AppLoaderData[]
    appDetails: appDetailsProps
    hasUnpaidInvoices: boolean
  }>()

  const submit = useSubmit()

  useEffect(() => {
    if (actionData) {
      const { status, client_secret, payment_method, subId } = actionData
      process3DSecureCard({
        submit,
        subId,
        STRIPE_PUBLISHABLE_KEY,
        status,
        client_secret,
        payment_method,
        redirectUrl: `/apps/${appDetails.clientId}/billing`,
      })
    }
  }, [actionData])

  useEffect(() => {
    if (toastNotification) {
      toast(toastNotification.type, {
        message: toastNotification.message,
      })
    }
  }, [toastNotification])

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <section className="flex flex-col gap-4">
        <PlanCard
          hasUnpaidInvoices={hasUnpaidInvoices}
          currentPlan={appDetails.appPlan}
          planType={ServicePlanType.FREE}
          paymentData={paymentData}
          featuresColor="text-gray-500"
        />
        <PlanCard
          hasUnpaidInvoices={hasUnpaidInvoices}
          currentPlan={appDetails.appPlan}
          planType={ServicePlanType.PRO}
          totalEntitlements={entitlements[ServicePlanType.PRO]?.entitlements}
          usedEntitlements={
            apps.filter((a) => a.appPlan === ServicePlanType.PRO).length
          }
          paymentData={paymentData}
          featuresColor="text-indigo-500"
        />
      </section>
    </>
  )
}
