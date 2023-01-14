import type { LoaderFunction } from '@remix-run/cloudflare'
import { loader as profileLoader } from '~/routes/$profile.json'

export const loader: LoaderFunction = profileLoader
