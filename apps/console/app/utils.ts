/**
 * @file app/utils.ts
 */

import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { useMatches } from '@remix-run/react'
import { useMemo } from 'react'
import { type StripeInvoice } from './utils/billing'
import type Stripe from 'stripe'

const DEFAULT_REDIRECT = '/'

// safeRedirect
// -----------------------------------------------------------------------------

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== 'string') {
    return defaultRedirect
  }

  if (!to.startsWith('/') || to.startsWith('//')) {
    return defaultRedirect
  }

  return to
}

// useMatchesData
// -----------------------------------------------------------------------------

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  )
  return route?.data
}

export const setPurchaseToastNotification = ({
  sub,
  flashSession,
}: {
  sub: Stripe.Subscription
  flashSession: any
}) => {
  const status = (sub.latest_invoice as Stripe.Invoice).status

  // https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses
  if (
    (sub.status === 'active' || sub.status === 'trialing') &&
    status === 'paid'
  ) {
    flashSession.flash(
      'toast_notification',
      JSON.stringify({
        type: ToastType.Success,
        message: 'Entitlement(s) successfully bought',
      })
    )
  } else {
    if (
      (sub.latest_invoice as unknown as StripeInvoice)?.payment_intent
        ?.status === 'requires_action'
    ) {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Warning,
          message: 'Payment requires additional action',
        })
      )
    } else {
      flashSession.flash(
        'toast_notification',
        JSON.stringify({
          type: ToastType.Error,
          message: 'Payment failed - check your card details',
        })
      )
    }
  }
}

export const redirectToPassport = ({
  PASSPORT_URL,
  login_hint,
  scope = '',
  state = 'skip',
  rollup_action = 'connect',
}: {
  PASSPORT_URL: string
  login_hint: string
  scope?: string
  state?: string
  rollup_action?: string
}) => {
  const currentURL = new URL(window.location.href)
  currentURL.search = ''

  const qp = new URLSearchParams()
  qp.append('scope', scope)
  qp.append('state', state)
  qp.append('client_id', 'console')

  qp.append('redirect_uri', currentURL.toString())
  qp.append('rollup_action', rollup_action)
  qp.append('login_hint', login_hint)

  window.location.href = `${PASSPORT_URL}/authorize?${qp.toString()}`
}
