import { ExternalDataPackageType } from '@proofzero/types/billing'
import { ExternalDataPackageFeatures } from '../types'

const packages: ExternalDataPackageFeatures[] = [
  {
    packageType: ExternalDataPackageType.BASE,
    title: 'Base Plan',
    reads: 1000,
    writes: 1000,
  },
]

export default packages.reduce((acc, curr) => {
  acc[curr.packageType] = curr
  return acc
}, {} as Record<ExternalDataPackageType, ExternalDataPackageFeatures>)
