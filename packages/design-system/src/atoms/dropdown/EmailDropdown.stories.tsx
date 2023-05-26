import React from 'react'
import { Dropdown, DropdownSelectListItem } from './DropdownSelectList'

import { OAuthAddressType, EmailAddressType, CryptoAddressType } from '@proofzero/types/address'
import { HiOutlineEnvelope } from 'react-icons/hi2'

import googleIcon from '@proofzero/design-system/src/atoms/providers/Google'
import microsoftIcon from '@proofzero/design-system/src/atoms/providers/Microsoft'
import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'

export default {
    title: 'Atoms/Dropdown/Email',
    component: Dropdown,
}



const getIcon = (
    type?: OAuthAddressType | EmailAddressType | CryptoAddressType
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

const listItems: Array<DropdownSelectListItem> = [
    {
        title: 'email@gmail.com',
        value: 'urn:rollupid:address/1',
        icon: getIcon(OAuthAddressType.Google),

    },
    {
        title: 'email@microsoft.com',
        value: 'urn:rollupid:address/2',
        icon: getIcon(OAuthAddressType.Microsoft),

    },
    {
        title: 'perez@apple.com',
        value: 'urn:rollupid:address/5',
        icon: getIcon(OAuthAddressType.Apple),

    },
    {
        title: 'email@yahoo.com',
        value: 'urn:rollupid:address/3',
        icon: getIcon(EmailAddressType.Email),
        selected: true,

    },
    {
        title: 'email@gmail.com',
        value: 'urn:rollupid:address/4',
        icon: getIcon(EmailAddressType.Email),

    },
]

const Template = () => (
    <div className="w-[280px]">
        <Dropdown
            items={listItems}
            onSelect={(val) => { console.log({ val }) }}
            placeholder='Select an Email Address'
            ConnectButtonPhrase="Connect New Email Address"
            ConnectButtonCallback={() => { console.log('Connect New Email Address') }}
        />
    </div>
)

export const EmailSelectExample = Template.bind({}) as any