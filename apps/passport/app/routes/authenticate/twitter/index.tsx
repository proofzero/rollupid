import { redirect } from '@remix-run/cloudflare'
import type {
  ActionArgs,
  ActionFunction,
  LoaderFunction,
} from '@remix-run/cloudflare'
import { TwitterStrategy, TwitterStrategyDefaultName } from 'remix-auth-twitter'

import { authenticator } from '~/auth.server'

export const action: ActionFunction = ({ request }: ActionArgs) => {
  const searchParams = new URL(request.url).searchParams
  console.log(`${INTERNAL_TWITTER_OAUTH_CALLBACK_URL}?${searchParams}`)
  authenticator.use(
    new TwitterStrategy(
      {
        clientID: INTERNAL_TWITTER_OAUTH_CLIENT_ID,
        clientSecret: SECRET_TWITTER_OAUTH_CLIENT_SECRET,
        callbackURL: `${INTERNAL_TWITTER_OAUTH_CALLBACK_URL}?${searchParams}`,
        includeEmail: true,
      },
      async ({ accessToken, accessTokenSecret, profile }) => {
        return {
          accessToken,
          accessTokenSecret,
          profile,
        }
      }
    )
  )
  return authenticator.authenticate(TwitterStrategyDefaultName, request)
}
