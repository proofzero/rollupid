import { ServicePlanType } from '@proofzero/types/account'
import { appendToastToFlashSession } from './toast.server'
import plans from '~/routes/__layout/billing/plans'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { commitFlashSession } from '~/utilities/session.server'

const isPlanGuarded = async (
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
  request: Request
) => {
  if (await isPlanGuarded(appPlan, gatePlan)) {
    const toastSession = await appendToastToFlashSession(request, {
      message: `This feature is not available for ${plans[appPlan].title}`,
      type: ToastType.Error,
    })

    throw new Response(null, {
      headers: {
        'Set-Cookie': await commitFlashSession(toastSession),
      },
    })
  }
}
