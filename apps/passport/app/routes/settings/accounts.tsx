import { EmailSelect } from '@proofzero/design-system/src/atoms/email/EmailSelect'
import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import { useOutletContext } from '@remix-run/react'
import {
  EmailAddressType,
  OAuthAddressType,
  NodeType,
} from '@proofzero/types/address'
export default function AccountsLayout() {
  const { connectedEmailProfiles } = useOutletContext<{
    connectedEmailProfiles: any
  }>()

  const gmail = connectedEmailProfiles
    .filter(
      (instance) =>
        instance.nodeType === NodeType.OAuth &&
        instance.type === OAuthAddressType.Google
    )
    .map((instance) => ({
      iconURL: googleIcon,
      email: instance.profile.email,
    }))

  const mcrst = connectedEmailProfiles
    .filter(
      (instance) =>
        instance.nodeType === NodeType.OAuth &&
        instance.type === OAuthAddressType.Microsoft
    )
    .map((instance) => ({
      iconURL: microsoftIcon,
      email: instance.profile.email,
    }))

  const other = connectedEmailProfiles
    .filter(
      (instance) =>
        instance.nodeType === NodeType.Email &&
        instance.type === EmailAddressType.Email
    )
    .map((instance) => ({
      email: instance.profile.email,
    }))

  console.log({ connectedEmailProfiles })

  return (
    <div>
      <EmailSelect
        items={[
          ...gmail,
          ...mcrst,
          ...other,
          { email: 'email@yahoo.com' },
          { email: 'email@microsoft.com', iconURL: microsoftIcon },
        ]}
        allowEmpty={true}
        enableAddNew={true}
      />
    </div>
  )
}
