import { ExternalAppDataPackageType } from '@proofzero/types/billing'

export default {
  [ExternalAppDataPackageType.STARTER]: {
    title: 'Starter',
    reads: 1000,
    writes: 1000,
  },
  [ExternalAppDataPackageType.SCALE]: {
    title: 'Scale',
    reads: 2000,
    writes: 2000,
  },
}
