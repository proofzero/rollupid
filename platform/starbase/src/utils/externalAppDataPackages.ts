import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { ExternalAppDataPackageDefinition } from '../types'

const packages: ExternalAppDataPackageDefinition[] = [
  {
    packageType: ExternalAppDataPackageType.STARTER,
    title: 'Base Plan',
    reads: 1000,
    writes: 1000,
  },
]

export default packages.reduce((acc, curr) => {
  acc[curr.packageType] = curr
  return acc
}, {} as Record<ExternalAppDataPackageType, ExternalAppDataPackageDefinition>)
