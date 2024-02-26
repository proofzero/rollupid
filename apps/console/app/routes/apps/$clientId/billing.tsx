import { Text } from '@proofzero/design-system/src/atoms/text/Text'
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
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import {
  useActionData,
  useFetcher,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'
import { BadRequestError } from '@proofzero/errors'
import type { ToastNotification, appDetailsProps } from '~/types'
import { type AppLoaderData } from '~/root'

import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  HiArrowUp,
  HiDotsVertical,
  HiOutlinePencilAlt,
  HiOutlineShoppingCart,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi'
import { TbDatabaseImport } from 'react-icons/tb'
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
import { PaymentData, ServicePlanType } from '@proofzero/types/billing'
import { GetEntitlementsOutput } from '@proofzero/platform/billing/src/jsonrpc/methods/getEntitlements'
import { PlanFeatures } from '~/components/Billing'
import { IdentityRefURN } from '@proofzero/urns/identity-ref'
import { IdentityGroupURNSpace } from '@proofzero/urns/identity-group'
import { IdentityURNSpace } from '@proofzero/urns/identity'
import plans, { PlanDetails } from '@proofzero/utils/billing/plans'
import { GetAppExternalDataUsageOutput } from '@proofzero/platform/starbase/src/jsonrpc/methods/getAppExternalDataUsage'
import AppDataStorageModal from '~/components/AppDataStorageModal/AppDataStorageModal'
import ExternalAppDataPackages from '@proofzero/utils/externalAppDataPackages'
import _ from 'lodash'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { Menu, Transition } from '@headlessui/react'
import { ConfirmCancelModal } from './storage.ostrich'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const jwt = await requireJWT(request, context.env)

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const appDetails = await coreClient.starbase.getAppDetails.query({
      clientId: params.clientId as string,
    })

    const appExternalStorageUsage =
      await coreClient.starbase.getAppExternalDataUsage.query({
        clientId: params.clientId as string,
      })

    const entitlements = await coreClient.billing.getEntitlements.query({
      URN: appDetails.ownerURN,
    })

    const paymentData = await coreClient.billing.getStripePaymentData.query({
      URN: appDetails.ownerURN,
    })

    const flashSession = await getFlashSession(request, context.env)
    let toastNotification: ToastNotification | undefined = undefined
    const toastStr = flashSession.get('toast_notification')
    if (toastStr) {
      toastNotification = JSON.parse(toastStr)
    }

    const groupID = IdentityGroupURNSpace.is(appDetails.ownerURN)
      ? appDetails.ownerURN.split('/')[1]
      : undefined

    return json(
      {
        entitlements,
        paymentData,
        toastNotification,
        STRIPE_PUBLISHABLE_KEY: context.env.STRIPE_PUBLISHABLE_KEY,
        groupID,
        appExternalStorageUsage,
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
  traceHeader: Record<'traceparent', string>,
  targetURN: IdentityRefURN
) => {
  const coreClient = createCoreClient(env.Core, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const entitlements = await coreClient.billing.getEntitlements.query({
    URN: targetURN,
  })

  let apps = []
  if (IdentityGroupURNSpace.is(targetURN)) {
    apps = await coreClient.starbase.listGroupApps.query()
  } else if (IdentityURNSpace.is(targetURN)) {
    apps = await coreClient.starbase.listApps.query()
  } else {
    throw new BadRequestError({
      message: `Invalid URN`,
    })
  }

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
    URN: targetURN,
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
  traceHeader: Record<'traceparent', string>,
  targetURN: IdentityRefURN
) => {
  const coreClient = createCoreClient(env.Core, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const entitlements = await coreClient.billing.getEntitlements.query({
    URN: targetURN,
  })

  const paymentData = await coreClient.billing.getStripePaymentData.query({
    URN: targetURN,
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
    planID: env.SECRET_STRIPE_PRO_PLAN_ID,
    SECRET_STRIPE_API_KEY: env.SECRET_STRIPE_API_KEY,
    quantity,
    subscriptionID: entitlements.subscriptionID,
    URN: targetURN,
  })

  setPurchaseToastNotification({
    sub,
    flashSession,
  })

  const invoiceStatus = (sub.latest_invoice as Stripe.Invoice)?.status

  if (
    (sub.status === 'active' || sub.status === 'trialing') &&
    invoiceStatus === 'paid'
  ) {
    await coreClient.billing.updateEntitlements.mutate({
      URN: targetURN,
      subscriptionID: sub.id,
      quantity: quantity,
      type: plan,
    })

    await coreClient.starbase.setAppPlan.mutate({
      URN: targetURN,
      clientId,
      plan,
    })
  }

  return sub
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request, context.env)

    const { clientId } = params
    if (!clientId) throw new BadRequestError({ message: 'Missing Client ID' })

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const appDetails = await coreClient.starbase.getAppDetails.query({
      clientId: params.clientId as string,
    })

    const spd = await coreClient.billing.getStripePaymentData.query({
      URN: appDetails.ownerURN,
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
          jwt!,
          plan,
          clientId,
          flashSession,
          context.env,
          traceHeader,
          appDetails.ownerURN
        )
        break
      }

      case 'purchase': {
        const sub = await processPurchaseOp(
          jwt!,
          plan,
          clientId,
          flashSession,
          context.env,
          traceHeader,
          appDetails.ownerURN
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
            clientId,
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
          <div className="flex flex-row items-center gap-2">
            <Text>
              {active ? null : '+'}${plan.price}
            </Text>
            <Text size="sm" className="text-gray-500">
              per month
            </Text>
          </div>
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
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div className="px-5 pt-5 flex flex-row justify-between items-center w-full">
        <Text size="lg" weight="semibold" className="text-left text-gray-800">
          Purchase Entitlement(s)
        </Text>
        <div
          className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
          onClick={() => {
            setIsOpen(false)
          }}
        >
          <HiOutlineX />
        </div>
      </div>

      {!paymentData?.customerID && (
        <section className="mt-3.5 mx-5">
          <ToastWithLink
            message="Please add Billing Information in Billing & Invoicing section"
            linkHref={`/billing/`}
            type={'warning'}
            linkText="Add Billing Information"
          />
        </section>
      )}

      {paymentData?.customerID && !paymentData.paymentMethodID && (
        <section className="mt-3.5 mx-5">
          <ToastWithLink
            message="Update your Payment Information to enable purchasing"
            linkHref={`/billing/payment`}
            type={'warning'}
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
            <Text size="lg" weight="semibold" className="text-gray-900">
              {`+$${plan.price}`}
            </Text>
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
        className={`w-[48vw] rounded-lg bg-white p-4 sm:p-6 flex flex-col gap-4 text-left`}
      >
        <div className="flex flex-row gap-4 items-start">
          <img src={dangerVector} />

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between mb-2 w-full">
              <Text size="lg" weight="medium" className="text-gray-900">
                Downgrade Application
              </Text>
              <div
                className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
                onClick={() => {
                  setIsOpen(false)
                }}
              >
                <HiOutlineX />
              </div>
            </div>

            <Text>
              You are about to downgrade the application to the{' '}
              {plans[updatedPlan].title}, removing the following features:
            </Text>

            <ul className="list-disc">
              {plans[currentPlan].features
                .filter(
                  (f) => f.type === 'current' && !Boolean(f.aggregateFeatures)
                )
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
    groupID,
    appExternalStorageUsage,
  } = useLoaderData<{
    STRIPE_PUBLISHABLE_KEY: string
    entitlements: GetEntitlementsOutput
    paymentData: PaymentData
    toastNotification?: ToastNotification
    groupID?: string
    appExternalStorageUsage: GetAppExternalDataUsageOutput
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
        updatePlanParams: {
          clientId: appDetails.clientId,
          plan: ServicePlanType.PRO,
        },
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

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      setIsSubscriptionModalOpen(false)
    }
  }, [fetcher])

  return (
    <>
      {isCancelModalOpen && (
        <ConfirmCancelModal
          isOpen={isCancelModalOpen}
          setIsOpen={setIsCancelModalOpen}
          clientID={appDetails.clientId!}
          redirectURL={`/apps/${appDetails.clientId}/billing`}
        />
      )}
      {isSubscriptionModalOpen && (
        <AppDataStorageModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          subscriptionFetcher={fetcher}
          clientID={appDetails.clientId!}
          currentPackage={
            appDetails.externalAppDataPackageDefinition?.packageDetails
              .packageType
          }
          topUp={appDetails.externalAppDataPackageDefinition?.autoTopUp}
          currentPrice={
            appDetails.externalAppDataPackageDefinition?.packageDetails.price
          }
          reads={appExternalStorageUsage?.readUsage}
          writes={appExternalStorageUsage?.writeUsage}
          readTopUp={appExternalStorageUsage?.readTopUp}
          writeTopUp={appExternalStorageUsage?.writeTopUp}
        />
      )}

      <Toaster position="top-right" reverseOrder={false} />

      <section className="mb-4 flex flex-col gap-4">
        <Text size="lg" weight="semibold">
          Usage based Services
        </Text>
        <table className="min-w-full table-auto border">
          <thead className="bg-gray-50">
            <tr className="rounded-tl-lg">
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Applies to service
                </Text>
              </th>
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Unit package
                </Text>
              </th>
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Service status
                </Text>
              </th>
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Usage
                </Text>
              </th>
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Auto top-up
                </Text>
              </th>
              <th className="px-6 py-3 text-right">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Action
                </Text>
              </th>
            </tr>
          </thead>

          {appDetails.externalAppDataPackageDefinition &&
            appExternalStorageUsage && (
              <tbody className="bg-white">
                <tr>
                  <td className="px-6 py-3">
                    <div className=" flex items-center gap-2">
                      <div className="bg-gray-100 rounded-full p-2">
                        <TbDatabaseImport className="w-4 h-4 text-gray-600" />
                      </div>

                      <Text size="sm" className="text-gray-500">
                        App data storage
                      </Text>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Text size="sm" className="text-gray-500">
                      {`${
                        ExternalAppDataPackages[
                          appDetails.externalAppDataPackageDefinition
                            .packageDetails.packageType
                        ].title
                      } Package`}
                    </Text>
                  </td>
                  <td className="px-6 py-3">
                    <Text size="sm" className="text-gray-500">
                      {_.upperFirst(
                        appDetails.externalAppDataPackageDefinition.status
                      )}
                    </Text>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <Text size="xs" className="text-gray-500">
                        {`Writes: ${appExternalStorageUsage.writeUsage}/${appExternalStorageUsage.writeAvailable}`}
                      </Text>
                      <Text size="xs" className="text-gray-500">
                        {`Reads: ${appExternalStorageUsage.readUsage}/${appExternalStorageUsage.readAvailable}`}
                      </Text>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Text size="sm" className="text-gray-500">
                      {appDetails.externalAppDataPackageDefinition.autoTopUp ? (
                        <FaCheck className="text-green-500" />
                      ) : (
                        <FaTimes className="text-red-500" />
                      )}
                    </Text>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end">
                      <Menu>
                        <Menu.Button>
                          <div
                            className="w-8 h-8 flex justify-center items-center cursor-pointer
          hover:bg-gray-100 hover:rounded-[6px]"
                          >
                            <HiDotsVertical className="text-lg text-gray-400" />
                          </div>
                        </Menu.Button>

                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items
                            className="absolute z-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100
          rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y
           divide-gray-100"
                          >
                            <div className="p-1 ">
                              <div
                                onClick={() => {
                                  setIsSubscriptionModalOpen(true)
                                }}
                                className="cursor-pointer"
                              >
                                <Menu.Item
                                  as="div"
                                  className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                  hover:rounded-[6px] hover:bg-gray-100"
                                >
                                  <HiOutlinePencilAlt className="text-xl font-normal text-gray-400" />
                                  <Text
                                    size="sm"
                                    weight="normal"
                                    className="text-gray-700"
                                  >
                                    Edit Package
                                  </Text>
                                </Menu.Item>
                              </div>
                            </div>

                            <div className="p-1">
                              <Menu.Item
                                as="div"
                                className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                hover:rounded-[6px] hover:bg-gray-100 "
                                onClick={() => {
                                  setIsCancelModalOpen(true)
                                }}
                              >
                                <HiOutlineTrash className="text-xl font-normal text-red-500" />

                                <Text
                                  size="sm"
                                  weight="normal"
                                  className="text-red-500"
                                >
                                  Cancel Service
                                </Text>
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          {!appExternalStorageUsage && (
            <tbody className="bg-white">
              <tr>
                <td className="px-6 py-3">
                  <div className=" flex items-center gap-2">
                    <div className="bg-gray-100 rounded-full p-2">
                      <TbDatabaseImport className="w-4 h-4 text-gray-600" />
                    </div>

                    <Text size="sm" className="text-gray-500">
                      App data storage
                    </Text>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <Text size="sm" className="text-gray-500">
                    -
                  </Text>
                </td>
                <td className="px-6 py-3">
                  <Text size="sm" className="text-gray-500">
                    Inactive
                  </Text>
                </td>
                <td className="px-6 py-3">
                  <Text size="sm" className="text-gray-500">
                    -
                  </Text>
                </td>
                <td className="px-6 py-3">
                  <Text size="sm" className="text-gray-500">
                    -
                  </Text>
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end">
                    <Button
                      btnType="secondary-alt"
                      btnSize="xs"
                      className="flex flex-row items-center gap-3"
                      type="submit"
                      onClick={() => {
                        setIsSubscriptionModalOpen(true)
                      }}
                    >
                      <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                      <Text size="sm">Purchase Package</Text>
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <Text size="lg" weight="semibold">
          Plan based Services
        </Text>
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
            apps
              .filter((a) => (groupID ? a.groupID === groupID : !a.groupID))
              .filter((a) => a.appPlan === ServicePlanType.PRO).length
          }
          paymentData={paymentData}
          featuresColor="text-indigo-500"
        />
      </section>
    </>
  )
}
