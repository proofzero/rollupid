import React from 'react'
import { DropdownConnectButton } from './DropdownConnectButton'

export default {
    title: 'Atoms/Dropdown/ConnectButton',
    component: DropdownConnectButton,
}

const Template = () => (
    <div className="w-[262px]">
        <DropdownConnectButton
            ConnectButtonPhrase="Connect New Account"
            ConnectButtonCallback={() => {
                return null
            }}
        />
    </div>
)

export const ConnectNewAccountButtonExample = Template.bind({}) as any