import { error } from 'itty-router-extras'

export const badRequest = () => error(400, 'bad request')
export const notAuthorized = () => error(403, 'not authorized')
export const notFound = () => error(404, 'not found')

export class StatusError extends Error {
  status: number
  constructor(status = 500, message = 'Internal Server Error') {
    super(message)
    this.status = status
  }
}
