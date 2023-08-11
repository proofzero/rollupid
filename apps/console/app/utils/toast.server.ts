import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { Session, SessionData } from '@remix-run/cloudflare'
import { Env } from 'bindings'
import { getFlashSession } from '~/utilities/session.server'

export type ToastModel = {
  type: ToastType
  message: string
}

export const appendToastToFlashSession = async (
  request: Request,
  toast: ToastModel,
  env: Env
) => {
  const flashSession = await getFlashSession(request, env)
  const toasts = flashSession.get('toasts') ?? []
  toasts.push(toast)

  flashSession.flash('toasts', toasts)

  return flashSession
}

export const getToastsAndFlashSession = async (request: Request, env: Env) => {
  const flashSession = (await getFlashSession(request, env)) as Session<
    SessionData,
    SessionData
  >
  const toasts = (flashSession.get('toasts') ?? []) as ToastModel[]

  return {
    flashSession,
    toasts,
  }
}
