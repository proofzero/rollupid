/**
 * @file app/shared/components/SiteHeader/index.tsx
 */

import { Form } from '@remix-run/react'
import { gatewayFromIpfs } from '@kubelt/utils'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'


// KubeltHeader
// -----------------------------------------------------------------------------

type KubeltHeaderProps = {
  avatarUrl: string
}

export default function KubeltHeader(props: KubeltHeaderProps) {
  return (
    <header className="flex flex-row-reverse shadow-xl p-4 bg-white text-slate-500">
      <Form action="/logout" method="post">
        <Avatar
          src={gatewayFromIpfs(props.avatarUrl) || ''}
          size="xs"
        />
      </Form>
    </header>
  )
}
