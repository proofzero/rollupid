import { ServicePlanType } from '@proofzero/types/billing'
import { appendToastToFlashSession } from './toast.server'
import plans from '~/routes/__layout/billing/plans'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { commitFlashSession } from '~/utilities/session.server'
import { Env } from 'bindings'

export const isPlanGuarded = (
  appPlan: ServicePlanType,
  gatePlan: ServicePlanType
) => {
  const typeImportance = [ServicePlanType.FREE, ServicePlanType.PRO]

  if (
    typeImportance.findIndex((ty) => ty === appPlan) <
    typeImportance.findIndex((ty) => ty === gatePlan)
  ) {
    return true
  }

  return false
}

export const planGuardWithToastException = async (
  appPlan: ServicePlanType,
  gatePlan: ServicePlanType,
  request: Request,
  env: Env
) => {
  if (isPlanGuarded(appPlan, gatePlan)) {
    const toastSession = await appendToastToFlashSession(
      request,
      {
        message: `This feature is not available for ${plans[appPlan].title}`,
        type: ToastType.Error,
      },
      env
    )

    throw new Response(null, {
      headers: {
        'Set-Cookie': await commitFlashSession(toastSession, env),
      },
    })
  }
}
