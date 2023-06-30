import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import plans, { PlanDetails } from '~/routes/__layout/gnillib/plans'
import { PlanFeatures } from '~/routes/__layout/gnillib'
import { PaymentData, ServicePlanType } from '@proofzero/types/account'
import { Button } from '@proofzero/design-system'
import { StatusPill } from '@proofzero/design-system/src/atoms/pills/StatusPill'
import {
  ActionFunction,
  LoaderFunction,
  Session,
  SessionData,
  json,
} from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import {
  commitFlashSession,
  getFlashSession,
  requireJWT,
} from '~/utilities/session.server'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import createAccountClient from '@proofzero/platform-clients/account'
import createStarbaseClient from '@proofzero/platform-clients/starbase'
import {
  getAuthzHeaderConditionallyFromToken,
  parseJwt,
} from '@proofzero/utils'
import { useLoaderData, useOutletContext, useSubmit } from '@remix-run/react'
import { GetEntitlementsOutput } from '@proofzero/platform/account/src/jsonrpc/methods/getEntitlements'
import { AccountURN } from '@proofzero/urns/account'
import { BadRequestError } from '@proofzero/errors'
import type { appDetailsProps } from '~/types'
import { AppLoaderData } from '~/root'
import {
  createSubscription,
  updateSubscription,
} from '~/services/billing/stripe'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import { ToastWithLink } from '@proofzero/design-system/src/atoms/toast/ToastWithLink'
import { useEffect, useState } from 'react'
import {
  HiArrowUp,
  HiOutlineExternalLink,
  HiOutlineShoppingCart,
} from 'react-icons/hi'
import {
  ToastType,
  Toaster,
  toast,
} from '@proofzero/design-system/src/atoms/toast'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const entitlements = await accountClient.getEntitlements.query()
    const paymentData = await accountClient.getStripePaymentData.query({
      accountURN,
    })

    const flashSession = await getFlashSession(request.headers.get('Cookie'))
    const successToast = flashSession.get('success_toast')
    const errorToast = flashSession.get('error_toast')

    return json(
      {
        entitlements,
        paymentData,
        successToast,
        errorToast,
      },
      {
        headers: {
          'Set-Cookie': await commitFlashSession(flashSession),
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
  traceHeader: Record<'traceparent', string>
) => {
  const parsedJwt = parseJwt(jwt)
  const accountURN = parsedJwt.sub as AccountURN

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const accountClient = createAccountClient(Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const entitlements = await accountClient.getEntitlements.query()

  const apps = await starbaseClient.listApps.query()
  const allotedApps = apps.filter((a) => a.appPlan === plan).length

  if (
    plan !== ServicePlanType.FREE &&
    allotedApps >= (entitlements.plans[plan]?.entitlements ?? 0)
  ) {
    throw new BadRequestError({
      message: `You have reached the maximum number of apps for this plan`,
    })
  }

  await starbaseClient.setAppPlan.mutate({
    accountURN,
    clientId,
    plan,
  })

  flashSession.flash('success_toast', `${plans[plan].title} assigned.`)
}

const processPurchaseOp = async (
  jwt: string,
  plan: ServicePlanType,
  clientId: string,
  flashSession: any,
  traceHeader: Record<'traceparent', string>
) => {
  const parsedJwt = parseJwt(jwt)
  const accountURN = parsedJwt.sub as AccountURN

  const starbaseClient = createStarbaseClient(Starbase, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const accountClient = createAccountClient(Account, {
    ...getAuthzHeaderConditionallyFromToken(jwt),
    ...traceHeader,
  })

  const entitlements = await accountClient.getEntitlements.query()

  const paymentData = await accountClient.getStripePaymentData.query({
    accountURN,
  })
  if (!paymentData || !paymentData.customerID) {
    throw new BadRequestError({
      message: `You must add a payment method before purchasing a plan`,
    })
  }

  const { customerID } = paymentData
  let sub
  let quantity
  try {
    if (!entitlements.subscriptionID) {
      quantity = 1
      sub = await createSubscription({
        customerID: customerID,
        planID: STRIPE_PRO_PLAN_ID,
        quantity,
        accountURN,
        handled: true,
      })
    } else {
      quantity = entitlements.plans[plan]?.entitlements
        ? entitlements.plans[plan]?.entitlements! + 1
        : 1

      sub = await updateSubscription({
        subscriptionID: entitlements.subscriptionID,
        planID: STRIPE_PRO_PLAN_ID,
        quantity,
        handled: true,
      })
    }
  } catch (e) {
    flashSession.flash(
      'error_toast',
      'Transaction failed. You were not charged.'
    )

    return new Response(null, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession),
      },
    })
  }

  await accountClient.updateEntitlements.mutate({
    accountURN: accountURN,
    subscriptionID: sub.id,
    quantity: quantity,
    type: plan,
  })

  await starbaseClient.setAppPlan.mutate({
    accountURN,
    clientId,
    plan,
  })

  flashSession.flash(
    'success_toast',
    `${plans[plan].title} purchased and assigned.`
  )
}

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request)
    if (!jwt) {
      throw new BadRequestError({
        message: 'Missing JWT',
      })
    }

    const { clientId } = params
    if (!clientId) throw new BadRequestError({ message: 'Missing Client ID' })

    const traceHeader = generateTraceContextHeaders(context.traceSpan)

    const fd = await request.formData()
    const op = fd.get('op') as 'update' | 'purchase'
    const { plan } = JSON.parse(fd.get('payload') as string) as {
      plan: ServicePlanType
    }

    const flashSession = await getFlashSession(request.headers.get('Cookie'))

    switch (op) {
      case 'update': {
        await processUpdateOp(jwt, plan, clientId, flashSession, traceHeader)
        break
      }

      case 'purchase': {
        await processPurchaseOp(jwt, plan, clientId, flashSession, traceHeader)
        break
      }
    }

    return new Response(null, {
      headers: {
        'Set-Cookie': await commitFlashSession(flashSession),
      },
    })
  }
)

const getAvailableEntitlements = (entitlement: {
  planType: ServicePlanType
  totalEntitlements?: number
  usedEntitlements?: number
}) => (entitlement.totalEntitlements ?? 0) - (entitlement.usedEntitlements ?? 0)

const PlanCard = ({ plan, active }: { plan: PlanDetails; active: boolean }) => {
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

          <a
            className="flex-1 flex justify-end"
            href="https://rollup.id/pricing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              btnType="secondary-alt"
              className="right-0 flex md:flex-row flex-col max-w-max
text-xs leading-4 items-center md:space-x-2"
            >
              Compare Plans
              <HiOutlineExternalLink className="ml-2" />
            </Button>
          </a>
        </header>
        <div className="w-full border-b border-gray-200"></div>
        <main>
          <div className="flex flex-row gap-7 p-4">
            <PlanFeatures plan={plan} />
          </div>
        </main>
        <div className="w-full border-t border-gray-200"></div>
        <footer className="p-4">
          <Text>${plan.price} per month</Text>
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
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  plan: PlanDetails
  paymentData?: PaymentData
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
            linkHref={`/gnillib/`}
            linkText="Add Billing Information"
          />
        </section>
      )}

      {paymentData?.customerID && !paymentData.paymentMethodID && (
        <section className="mt-3.5 mx-5">
          <ToastWithLink
            message="Update your Payment Information to enable purchasing"
            linkHref={`/gnillib/payment`}
            linkText="Update payment information"
          />
        </section>
      )}

      <section className="m-5 border rounded-lg">
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

          <PlanFeatures plan={plan} />
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
          disabled={!paymentData?.paymentMethodID}
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

const EntitlementsCardButton = ({
  currentPlan,
  entitlement,
  paymentData,
}: {
  currentPlan: ServicePlanType
  entitlement: {
    planType: ServicePlanType
    totalEntitlements?: number
    usedEntitlements?: number
  }
  paymentData: PaymentData
}) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  const getOperation = (
    planType: ServicePlanType,
    currentPlanType: ServicePlanType
  ) => {
    const typeImportance = [ServicePlanType.FREE, ServicePlanType.PRO]
    if (
      typeImportance.findIndex((ty) => ty === planType) <
      typeImportance.findIndex((ty) => ty === currentPlanType)
    ) {
      return <>Downgrade</>
    } else {
      return (
        <span className="flex flex-row gap-2 items-center">
          <HiArrowUp /> Upgrade to {plans[planType].title.split(' ')[0]}
        </span>
      )
    }
  }

  const op =
    entitlement.planType === ServicePlanType.FREE ||
    getAvailableEntitlements(entitlement) > 0
      ? 'update'
      : 'purchase'

  const submit = useSubmit()

  return (
    <>
      <PurchaseConfirmationModal
        isOpen={showPurchaseModal}
        setIsOpen={setShowPurchaseModal}
        plan={plans[entitlement.planType]}
        paymentData={paymentData}
      />
      <Button
        btnType="secondary-alt"
        btnSize="xs"
        onClick={() => {
          if (op === 'update') {
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
            setShowPurchaseModal(true)
          }
        }}
      >
        {op === 'update' ? (
          getOperation(entitlement.planType, currentPlan)
        ) : (
          <span className="flex flex-row gap-2 items-center">
            <HiOutlineShoppingCart className="w-4 h-4" /> Purchase
          </span>
        )}
      </Button>
    </>
  )
}

const EntitlementsCard = ({
  currentPlan,
  entitlements,
  paymentData,
}: {
  currentPlan: ServicePlanType
  entitlements: {
    planType: ServicePlanType
    totalEntitlements?: number
    usedEntitlements?: number
  }[]
  paymentData: PaymentData
}) => {
  return (
    <article className="bg-white rounded border">
      <header className="flex flex-row justify-between items-center p-4">
        <div>
          <Text size="lg" weight="semibold" className="text-gray-900">
            Assigned Entitlements
          </Text>
        </div>
      </header>
      <div className="w-full border-b border-gray-200"></div>
      <main>
        <div className="w-full">
          {entitlements.map((entitlement, i) => (
            <div key={plans[entitlement.planType].title}>
              <div className="flex flex-row justify-between items-center w-full p-4">
                <div className="flex-1 flex flex-row gap-4 items-center">
                  <div>
                    <Text size="sm" weight="medium" className="text-gray-900">
                      {plans[entitlement.planType].title}
                    </Text>
                    <Text size="sm" weight="medium" className="text-gray-500">
                      {entitlement.planType === ServicePlanType.FREE &&
                        'unlimited'}

                      {entitlement.planType !== ServicePlanType.FREE &&
                        `${getAvailableEntitlements(entitlement)} available`}
                    </Text>
                  </div>

                  {currentPlan === entitlement.planType && (
                    <StatusPill status="success" text="Active" />
                  )}
                </div>

                {entitlement.planType !== currentPlan && (
                  <EntitlementsCardButton
                    currentPlan={currentPlan}
                    entitlement={entitlement}
                    paymentData={paymentData}
                  />
                )}
              </div>
              {i < entitlements.length - 1 && (
                <div className="w-full border-b border-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </main>
    </article>
  )
}

export default () => {
  const {
    entitlements: { plans: entitlements },
    paymentData,
    successToast,
    errorToast,
  } = useLoaderData<{
    entitlements: GetEntitlementsOutput
    paymentData: PaymentData
    successToast: string
    errorToast: string
  }>()

  const { apps, appDetails } = useOutletContext<{
    apps: AppLoaderData[]
    appDetails: appDetailsProps
  }>()

  useEffect(() => {
    if (successToast) {
      toast(ToastType.Success, {
        message: successToast,
      })
    }
  }, [successToast])

  useEffect(() => {
    if (errorToast) {
      toast(ToastType.Error, {
        message: errorToast,
      })
    }
  }, [errorToast])

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <section className="flex flex-col gap-4">
        <PlanCard
          active={appDetails.appPlan === ServicePlanType.PRO}
          plan={plans[ServicePlanType.PRO]}
        />
        <EntitlementsCard
          currentPlan={appDetails.appPlan}
          entitlements={[
            {
              planType: ServicePlanType.FREE,
            },
            {
              planType: ServicePlanType.PRO,
              totalEntitlements:
                entitlements[ServicePlanType.PRO]?.entitlements,
              usedEntitlements: apps.filter(
                (a) => a.appPlan === ServicePlanType.PRO
              ).length,
            },
          ]}
          paymentData={paymentData}
        />
      </section>
    </>
  )
}
