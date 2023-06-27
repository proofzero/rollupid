import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import plans, { PlanDetails } from '~/routes/__layout/gnillib/plans'
import { PlanFeatures } from '~/routes/__layout/gnillib'
import { ServicePlanType } from '@proofzero/types/account'
import { Button } from '@proofzero/design-system'
import { StatusPill } from '@proofzero/design-system/src/atoms/pills/StatusPill'
import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { requireJWT } from '~/utilities/session.server'
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

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request)

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const accountClient = createAccountClient(Account, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const entitlements = await accountClient.getEntitlements.query()

    return {
      entitlements,
    }
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, params, context }) => {
    const jwt = await requireJWT(request)
    const parsedJwt = parseJwt(jwt!)
    const accountURN = parsedJwt.sub as AccountURN

    const { clientId } = params
    if (!clientId) throw new BadRequestError({ message: 'Missing Client ID' })

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const starbaseClient = createStarbaseClient(Starbase, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const fd = await request.formData()
    const op = fd.get('op') as 'update'
    const payload = JSON.parse(fd.get('payload') as string) as {
      plan: ServicePlanType
    }

    switch (op) {
      case 'update': {
        await starbaseClient.setAppPlan.mutate({
          accountURN,
          clientId,
          plan: payload.plan,
        })
        break
      }
    }

    return null
  }
)

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

          <Button btnType="secondary-alt">Compare Plans</Button>
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

const EntitlementsCard = ({
  currentPlan,
  entitlements,
}: {
  currentPlan: ServicePlanType
  entitlements: {
    planType: ServicePlanType
    subtitle: string
  }[]
}) => {
  const submit = useSubmit()

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
                      {entitlement.subtitle}
                    </Text>
                  </div>

                  {currentPlan === entitlement.planType && (
                    <StatusPill status="success" text="Active" />
                  )}
                </div>

                <Button
                  btnType="secondary-alt"
                  btnSize="xs"
                  onClick={() => {
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
                  }}
                >
                  Upgrade
                </Button>
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
  } = useLoaderData<{
    entitlements: GetEntitlementsOutput
  }>()

  const { apps, appDetails } = useOutletContext<{
    apps: AppLoaderData[]
    appDetails: appDetailsProps
  }>()

  return (
    <>
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
              subtitle: 'unlimited',
            },
            {
              planType: ServicePlanType.PRO,
              subtitle: `${
                (entitlements[ServicePlanType.PRO]?.entitlements ?? 0) -
                apps.filter((a) => a.appPlan === ServicePlanType.PRO).length
              } available`,
            },
          ]}
        />
      </section>
    </>
  )
}
