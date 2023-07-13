import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { Session, SessionData } from '@remix-run/cloudflare'
import { getFlashSession } from '~/utilities/session.server'

export const appendToastToFlashSession = async (
  request: Request,
  toast: { type: ToastType; message: string }
) => {
  const flashSession = await getFlashSession(request.headers.get('Cookie'))
  const toasts = flashSession.get('toasts') ?? []
  toasts.push(toast)

  flashSession.flash('toasts', toasts)

  return flashSession
}

export const getToastsAndFlashSession = async (request: Request) => {
  const flashSession = (await getFlashSession(
    request.headers.get('Cookie')
  )) as Session<SessionData, SessionData>
  const toasts = (flashSession.get('toasts') ?? []) as {
    type: ToastType
    message: string
  }[]

  return {
    flashSession,
    toasts,
  }
}
