import { LoaderFunction } from '@remix-run/cloudflare'
import { loader as profileLoader } from '~/routes/__profile/$profile.json'

export const loader: LoaderFunction = profileLoader
