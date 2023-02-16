import type { LoaderFunction } from '@remix-run/cloudflare'
import { redirect } from 'react-router-dom'

export const loader: LoaderFunction = () => {
  return redirect('./links')
}
