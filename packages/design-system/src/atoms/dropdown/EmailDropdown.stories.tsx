import React from 'react'
import { Dropdown, SelectListItem } from './DropdownSelectList'

import { OAuthAddressType, EmailAddressType, CryptoAddressType } from '@proofzero/types/address'
import { OptionType } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { HiOutlineEnvelope } from 'react-icons/hi2'

import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import appleIcon from '@proofzero/design-system/src/atoms/providers/Apple'

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
        title: 'email@gmail.com',
        label: 'urn:rollupid:address/1',
        icon: getIcon(OAuthAddressType.Google),
        details: {
            type: OAuthAddressType.Google,
        }
    },
    {
        title: 'email@microsoft.com',
        label: 'urn:rollupid:address/2',
        icon: getIcon(OAuthAddressType.Microsoft),
        details: {
            type: OAuthAddressType.Microsoft,
        }
    },
    {
        title: 'perez@apple.com',
        label: 'urn:rollupid:address/5',
        icon: getIcon(OAuthAddressType.Apple),
        details: {
            type: OAuthAddressType.Apple,
        }
    },
    {
        title: 'email@yahoo.com',
        label: 'urn:rollupid:address/3',
        icon: getIcon(EmailAddressType.Email),
        details: {
            type: EmailAddressType.Email,
            default: true,
        }
    },
    {
        title: 'email@gmail.com',
        label: 'urn:rollupid:address/4',
        icon: getIcon(EmailAddressType.Email),
        details: {
            type: EmailAddressType.Email,
        }
    },
]

const Template = () => (
    <div className="w-[280px]">
        <Dropdown
            values={listItems}
            onSelect={(val) => { console.log({ val }) }}
            placeholder='Select an Email Address'
            ConnectButtonPhrase="Connect New Email Address"
            ConnectButtonCallback={() => { console.log('Connect New Email Address') }}
        />
    </div>
)

export const EmailSelectExample = Template.bind({}) as any