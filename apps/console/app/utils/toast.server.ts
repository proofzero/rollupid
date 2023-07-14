import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { Session, SessionData } from '@remix-run/cloudflare'
import { Env } from 'bindings'
import { getFlashSession } from '~/utilities/session.server'

export const appendToastToFlashSession = async (
  request: Request,
  toast: { type: ToastType; message: string },
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
  const toasts = (flashSession.get('toasts') ?? []) as {
    type: ToastType
    message: string
  }[]

  return {
    flashSession,
    toasts,
  }
}
