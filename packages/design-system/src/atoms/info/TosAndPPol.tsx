import React from 'react'
import iIcon from './i.svg'
import { Text } from '../text/Text'


import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../popover/Popover'


export const TosAndPPol = () => {
    return (
        <Popover>
            <PopoverTrigger className='h-4 w-4 flex items-center'>
                <img src={iIcon} alt="info" /></PopoverTrigger>
            <PopoverContent data-top className='z-999 border border-gray-300 rounded-lg bg-white
                     px-3.5 py-4 mb-2 w-[360px] max-h-[182px] shadow'>
                <Text size="base" weight='medium' className='mt-3'>
                    What is Rollup ID?
                </Text>
                <Text size="sm" className='text-gray-500 mt-2 mb-4'>
                    Rollup ID is a user management platform designed to
                    <strong className='font-semibold'> prioritize privacy, security, and ease of use</strong>.
                </Text>
                <div className='flex flex-row space-x-4 items-center text-xs text-indigo-500 mb-6'>
                    <a
                        href='https://rollup.id'
                        target="_blank"
                        rel="noreferrer"
                    >
                        Rollup Website
                    </a>
                    <a
                        href="https://rollup.id/tos"
                        target="_blank"
                        rel="noreferrer">
                        Terms of Service
                    </a>
                    <a
                        href="https://rollup.id/privacy-policy"
                        target="_blank"
                        rel="noreferrer">
                        Privacy Policy
                    </a>
                </div>
            </PopoverContent>
        </Popover >)
}
