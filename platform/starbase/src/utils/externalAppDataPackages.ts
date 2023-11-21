import { ExternalAppDataPackageType } from '@proofzero/types/billing'

export default {
  [ExternalAppDataPackageType.STARTER]: {
    title: 'Starter Plan',
    reads: 1000,
    writes: 1000,
  },
}
