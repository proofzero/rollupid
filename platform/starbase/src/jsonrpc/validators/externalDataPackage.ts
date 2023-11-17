import { ExternalDataPackageType } from '@proofzero/types/billing'
import { z } from 'zod'

export const ExternalDataPackageFeaturesSchema = z.object({
  packageType: z.nativeEnum(ExternalDataPackageType),
  title: z.string(),
  reads: z.number(),
  writes: z.number(),
})
