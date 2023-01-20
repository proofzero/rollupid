import type { ActionArgs, ActionFunction } from '@remix-run/cloudflare'
import { GoogleStrategy } from 'remix-auth-google'
import { authenticator } from '~/auth.server'

export const action: ActionFunction = ({ request }: ActionArgs) => {
  const searchParams = new URL(request.url).searchParams
  authenticator.use(
    new GoogleStrategy(
      {
        clientID: INTERNAL_GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: SECRET_GOOGLE_OAUTH_CLIENT_SECRET,
        callbackURL: `${INTERNAL_GOOGLE_OAUTH_CALLBACK_URL}?${searchParams}`,
      },
      async ({ accessToken, refreshToken, extraParams, profile }) => {
        return {
          accessToken,
          refreshToken,
          extraParams,
          profile,
        }
      }
    )
  )
  return authenticator.authenticate('google', request)
}
