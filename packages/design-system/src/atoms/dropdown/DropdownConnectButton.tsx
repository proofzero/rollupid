import React from 'react'
import { Button } from '../buttons/Button'
import { TbCirclePlus } from 'react-icons/tb'
import { Text } from '../text/Text'

export const DropdownConnectButton = ({
    ConnectButtonPhrase,
    ConnectButtonCallback,
    className,
}: {
    ConnectButtonPhrase: string
    ConnectButtonCallback: () => void
    className?: string
}) => {
    return (
        <Button
            btnType="secondary-alt"
            onClick={ConnectButtonCallback}
            className={`w-full min-w-[238px] flex flex-row items-center gap-1 justify-center px-[12px] ${className}`}
        >
            <TbCirclePlus size={18} />
            <Text size="sm">{ConnectButtonPhrase}</Text>
        </Button>
    )
}