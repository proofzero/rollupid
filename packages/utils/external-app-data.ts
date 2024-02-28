import { InternalServerError } from '@proofzero/errors'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'

interface IAppDataStoragePricingEnv {
  SECRET_STRIPE_APP_DATA_STORAGE_PRICE_IDS: string
}

export type AppDataStoragePricingEnvObj = {
  SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID: string
  SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID: string
  SECRET_STRIPE_APP_DATA_STORAGE_STARTER_TOP_UP_PRICE_ID: string
  SECRET_STRIPE_APP_DATA_STORAGE_SCALE_TOP_UP_PRICE_ID: string
}

export const getAppDataStoragePricingEnv = (env: IAppDataStoragePricingEnv) => {
  let storagePriceEnvVars = env.SECRET_STRIPE_APP_DATA_STORAGE_PRICE_IDS
  if (!storagePriceEnvVars || storagePriceEnvVars === '') {
    throw new InternalServerError({
      message: `Could not find storage price env vars.`,
    })
  }

  let parsedStoragePriceEnvVars
  try {
    parsedStoragePriceEnvVars = JSON.parse(
      storagePriceEnvVars
    ) as AppDataStoragePricingEnvObj
  } catch (ex) {
    throw new InternalServerError({
      message: `Could not parse storage price env vars.`,
    })
  }

  if (
    !parsedStoragePriceEnvVars.SECRET_STRIPE_APP_DATA_STORAGE_STARTER_PRICE_ID ||
    !parsedStoragePriceEnvVars.SECRET_STRIPE_APP_DATA_STORAGE_SCALE_PRICE_ID ||
    !parsedStoragePriceEnvVars.SECRET_STRIPE_APP_DATA_STORAGE_STARTER_TOP_UP_PRICE_ID ||
    !parsedStoragePriceEnvVars.SECRET_STRIPE_APP_DATA_STORAGE_SCALE_TOP_UP_PRICE_ID
  ) {
    throw new InternalServerError({
      message: `One of the required keys is missing in storage price env vars`,
    })
  }

  return parsedStoragePriceEnvVars
}

export const packageTypeToPriceID = (
  env: IAppDataStoragePricingEnv,
  packageType: ExternalAppDataPackageType
) => {
  const storagePrices = getAppDataStoragePricingEnv(env)

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

export const packageTypeToTopUpPriceID = (
  env: IAppDataStoragePricingEnv,
  packageType: ExternalAppDataPackageType
) => {
  const storagePrices = getAppDataStoragePricingEnv(env)

  switch (packageType) {
    case ExternalAppDataPackageType.STARTER:
      return storagePrices.SECRET_STRIPE_APP_DATA_STORAGE_STARTER_TOP_UP_PRICE_ID
    case ExternalAppDataPackageType.SCALE:
      return storagePrices.SECRET_STRIPE_APP_DATA_STORAGE_SCALE_TOP_UP_PRICE_ID
    default:
      throw new InternalServerError({
        message: 'Invalid package type',
      })
  }
}
