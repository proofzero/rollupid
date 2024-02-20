import { InternalServerError } from '@proofzero/errors'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'

interface IAppDataStoragePricingEnv {
  SECRET_STRIPE_APP_DATA_STORAGE_PRICE_IDS: string
}

type AppDataStoragePricingEnvObj = {
  SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID: string
  SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID: string
}

export const packageTypeToPriceID = (
  env: IAppDataStoragePricingEnv,
  packageType: ExternalAppDataPackageType
) => {
  const storagePrices = JSON.parse(
    env.SECRET_STRIPE_APP_DATA_STORAGE_PRICE_IDS
  ) as AppDataStoragePricingEnvObj

  switch (packageType) {
    case ExternalAppDataPackageType.STARTER:
      return storagePrices.SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID
    case ExternalAppDataPackageType.SCALE:
      return storagePrices.SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID
    default:
      throw new InternalServerError({
        message: 'Invalid package type',
      })
  }
}
