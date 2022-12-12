/**
 * @file app/shared/components/SiteHeader/index.tsx
 */

import { Form } from '@remix-run/react'

// TODO display user's 3iD avatar.
import avatar from '~/images/avatar.png'

// KubeltHeader
// -----------------------------------------------------------------------------

type KubeltHeaderProps = {}

export default function KubeltHeader({}: KubeltHeaderProps) {
  return (
    <header className="flex flex-row-reverse shadow-xl p-4 bg-white text-slate-500">
      <Form action="/logout" method="post">
        <img className="inline-block pl-6" src={avatar} />
      </Form>
    </header>
  )
}
