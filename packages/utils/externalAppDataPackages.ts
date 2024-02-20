import { ExternalAppDataPackageType } from '@proofzero/types/billing'

export default {
  [ExternalAppDataPackageType.STARTER]: {
    title: 'Starter',
    reads: 5,
    writes: 5,
    price: 5,
  },
  [ExternalAppDataPackageType.SCALE]: {
    title: 'Scale',
    reads: 10,
    writes: 10,
    price: 10,
  },
}
