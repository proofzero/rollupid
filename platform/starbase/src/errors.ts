import { BadRequestError } from '@proofzero/errors'

export const ExternalStorageAlreadyEnabledError = new BadRequestError({
  message: 'external storage already enabled',
})

export const ExternalStorageAlreadyDisabledError = new BadRequestError({
  message: 'external storage already disabled',
})
