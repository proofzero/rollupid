export enum ERROR_CODES {
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
}

export const HTTP_STATUS_CODES = {
  [ERROR_CODES.BAD_REQUEST]: 400,
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.CONFLICT]: 409,
}

export const ERROR_MESSAGES = {
  [ERROR_CODES.BAD_REQUEST]: 'bad request',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'internal server error',
  [ERROR_CODES.UNAUTHORIZED]: 'not authorized',
  [ERROR_CODES.FORBIDDEN]: 'forbidden',
  [ERROR_CODES.NOT_FOUND]: 'not found',
  [ERROR_CODES.CONFLICT]: 'conflict',
}

export type RollupErrorOptions = {
  code?: ERROR_CODES
  message?: string
  cause?: unknown
  stack?: string
}

export interface RollupError {
  code: ERROR_CODES
  message: string
  name: string
  cause?: object
}

export class RollupError extends Error {
  public code: ERROR_CODES
  public message: string

  constructor(options?: RollupErrorOptions) {
    if (!options) options = {}
    options.code = options.code ?? ERROR_CODES.INTERNAL_SERVER_ERROR
    options.message = options.message ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    super(options.message, { cause: options.cause })
    this.code = options.code
    this.message = options.message
    this.name = 'RollupError'
  }
}

export class BadRequestError extends RollupError {
  constructor(options?: RollupErrorOptions) {
    if (!options) options = {}
    options.code = options.code ?? ERROR_CODES.BAD_REQUEST
    options.message = options.message ?? ERROR_MESSAGES.BAD_REQUEST
    super(options)
  }
}

export class UnauthorizedError extends RollupError {
  constructor(options?: RollupErrorOptions) {
    if (!options) options = {}
    options.code = options.code ?? ERROR_CODES.UNAUTHORIZED
    options.message = options.message ?? ERROR_MESSAGES.UNAUTHORIZED
    super(options)
  }
}

export class ForbiddenError extends RollupError {
  constructor(options?: RollupErrorOptions) {
    if (!options) options = {}
    options.code = options.code ?? ERROR_CODES.FORBIDDEN
    options.message = options.message ?? ERROR_MESSAGES.FORBIDDEN
    super(options)
  }
}

export class NotFoundError extends RollupError {
  constructor(options?: RollupErrorOptions) {
    if (!options) options = {}
    options.code = options.code ?? ERROR_CODES.NOT_FOUND
    options.message = options.message ?? ERROR_MESSAGES.NOT_FOUND
    super(options)
  }
}

export class ConflictError extends RollupError {
  constructor(options?: RollupErrorOptions) {
    if (!options) options = {}
    options.code = options.code ?? ERROR_CODES.CONFLICT
    options.message = options.message ?? ERROR_MESSAGES.CONFLICT
    super(options)
  }
}

export class InternalServerError extends RollupError {
  constructor(options?: RollupErrorOptions) {
    if (!options) options = {}
    options.code = options.code ?? ERROR_CODES.INTERNAL_SERVER_ERROR
    options.message = options.message ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    super(options)
  }
}
