import { InternalServerError } from '@proofzero/errors'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'

interface IAppDataStoragePricingEnv {
  SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID: string
  SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID: string
}

export const packageTypeToPriceID = (
  env: IAppDataStoragePricingEnv,
  packageType: ExternalAppDataPackageType
) => {
  switch (packageType) {
    case ExternalAppDataPackageType.STARTER:
      return env.SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID
    case ExternalAppDataPackageType.SCALE:
      return env.SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID
    default:
      throw new InternalServerError({
        message: 'Invalid package type',
      })
  }
}
