import React from 'react'
import { Dropdown, SelectListItem } from './Dropdown'

import { OAuthAddressType, EmailAddressType, CryptoAddressType } from '@proofzero/types/address'
import { OptionType } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { HiOutlineEnvelope } from 'react-icons/hi2'

import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import appleIcon from '@proofzero/design-system/src/assets/social_icons/apple.svg'

export default {
    title: 'Atoms/Dropdown/Email',
    component: Dropdown,
}



const getIcon = (
    type?: OAuthAddressType | EmailAddressType | OptionType | CryptoAddressType
): JSX.Element => {
    return type
        ? type === OAuthAddressType.Microsoft
            ? <img src={microsoftIcon} className="w-4 h-4 mr-3" />
            : type === OAuthAddressType.Apple
                ? <img src={appleIcon} className="w-4 h-4 mr-3" />
                : type === OAuthAddressType.Google
                    ? <img src={googleIcon} className="w-4 h-4 mr-3" />
                    : type === EmailAddressType.Email
                        ? <HiOutlineEnvelope className="w-4 h-4 mr-3" />
                        : null
        : null
}

const listItems: SelectListItem[] = [
    {
        type: OAuthAddressType.Google,
        title: 'email@gmail.com',
        identifier: 'urn:rollupid:address/1',
        icon: getIcon(OAuthAddressType.Google),
    },
    {
        type: OAuthAddressType.Microsoft,
        title: 'email@microsoft.com',
        identifier: 'urn:rollupid:address/2',
        icon: getIcon(OAuthAddressType.Microsoft),
    },
    {
        type: EmailAddressType.Email,
        title: 'email@yahoo.com',
        identifier: 'urn:rollupid:address/3',
        icon: getIcon(EmailAddressType.Email),
    },
    {
        type: EmailAddressType.Email,
        title: 'email@gmail.com',
        identifier: 'urn:rollupid:address/4',
        icon: getIcon(EmailAddressType.Email),
    },
]

const Template = () => (
    <div className="w-[280px]">
        <Dropdown
            values={listItems}
            onSelect={(val) => { console.log({ val }) }}
            defaultIdentifier={listItems[1].identifier}
            placeholder='Select an Email Address'
            ConnectButtonPhrase="Connect New Email Address"
            ConnectButtonCallback={() => { console.log('Connect New Email Address') }}
        />
    </div>
)

export const EmailSelectExample = Template.bind({}) as any