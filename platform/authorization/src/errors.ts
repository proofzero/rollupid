import { BadRequestError, UnauthorizedError } from '@proofzero/errors'

export class UnsupportedGrantTypeError extends BadRequestError {
  constructor(grantType: string) {
    super({
      message: `unsupported grant type: ${grantType}`,
    })
  }
}

export class UnsupportedResponseTypeError extends BadRequestError {
  constructor(responseType: string) {
    super({
      message: 'unsupported response type',
      cause: { responseType },
    })
  }
}

export const MismatchClientIdError = new BadRequestError({
  message: 'mismatch client id',
})

export const MissingIdentityNameError = new BadRequestError({
  message: 'missing identity name',
})

export const MissingClientIdError = new BadRequestError({
  message: 'missing client id',
})

export const MissingSubjectError = new BadRequestError({
  message: 'missing subject',
})

export const InvalidClientCredentialsError = new BadRequestError({
  message: 'invalid client credentials',
})

export const ExpiredCodeError = new UnauthorizedError({
  message: 'expired code',
})

export const ExpiredTokenError = new UnauthorizedError({
  message: 'expired token',
})

export const InvalidTokenError = new UnauthorizedError({
  message: 'invalid token',
})

export const TokenClaimValidationFailedError = new UnauthorizedError({
  message: 'token claim validation failed',
})

export const TokenVerificationFailedError = new UnauthorizedError({
  message: 'token verification failed',
})
