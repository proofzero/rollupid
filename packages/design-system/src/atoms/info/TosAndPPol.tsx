import React, { Fragment, useState } from 'react'
import iIcon from './i.svg'
import { Popover, Transition } from '@headlessui/react'
import { Text } from '../text/Text'
import { usePopper } from 'react-popper'


export const TosAndPPol = () => {
    let [referenceElement, setReferenceElement] = useState(null)
    let [popperElement, setPopperElement] = useState(null)
    let { styles, attributes } = usePopper(referenceElement, popperElement)


    return (
        <Popover className="ring-white h-4 w-4 flex items-center">
            <Popover.Button className="bg-white text-black z-999 w-max ring-white"
                ref={setReferenceElement}>
                <img src={iIcon} alt="info" />
            </Popover.Button>
            <div data-popper-arrow></div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                    className="z-999 border border-gray-300 rounded-lg bg-white
                    px-3.5 py-4 mb-2 max-w-[360px] max-h-[182px] shadow">
                    <Text size="base" weight='medium' className='mt-3'>
                        What is Rollup ID?
                    </Text>
                    <div id="arrow" style={styles.arrow} data-popper-arrow></div>
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
                </Popover.Panel >
            </Transition>
        </Popover>
    )
}

