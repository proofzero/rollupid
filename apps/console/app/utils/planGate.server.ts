import { ServicePlanType } from '@proofzero/types/account'

export default async (appPlan: ServicePlanType, gatePlan: ServicePlanType) => {
  const typeImportance = [ServicePlanType.FREE, ServicePlanType.PRO]

  if (
    typeImportance.findIndex((ty) => ty === appPlan) <
    typeImportance.findIndex((ty) => ty === gatePlan)
  ) {
    return true
  }

  return false
}
