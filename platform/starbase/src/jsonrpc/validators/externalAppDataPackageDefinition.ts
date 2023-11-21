import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { z } from 'zod'

export const ExternalAppDataPackageDefinitionSchema = z.object({
  packageType: z.nativeEnum(ExternalAppDataPackageType),
  title: z.string(),
  reads: z.number(),
  writes: z.number(),
})
