import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { z } from 'zod'

export enum ExternalAppDataPackageStatus {
  Enabled = 'enabled',
  Deleting = 'deleting',
}

export const ExternalAppDataPackageDetailsSchema = z.object({
  packageType: z.nativeEnum(ExternalAppDataPackageType),
  title: z.string(),
  reads: z.number(),
  writes: z.number(),
})

export const ExternalAppDataPackageDefinitionSchema = z.object({
  packageDetails: ExternalAppDataPackageDetailsSchema,
  status: z.nativeEnum(ExternalAppDataPackageStatus),
})