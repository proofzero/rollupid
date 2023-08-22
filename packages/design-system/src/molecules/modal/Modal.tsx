import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

import classNames from 'classnames'

export type ModalProps = {
  children: any
  isOpen: boolean
  handleClose?: (value: boolean) => void
  fixed?: boolean
}

export const Modal = ({
  isOpen = false,
  fixed = false,
  handleClose,
  children,
  ...rest
}: ModalProps) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        as="div"
        className="relative z-[100]"
        onClose={(val: boolean) => {
          if (handleClose) handleClose(val)
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-[101] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center min-[480px]:p-2 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`${fixed ? 'pb-10' : ''}`}>
                <div
                  className={classNames(
                    'border bg-white rounded-lg shadow-xl thin-scrollbar overflow-y-auto ',
                    {
                      'h-max min-w-fit w-max min-[480px]:w-[96vw] lg:w-[62vw] h-[96vh] lg:h-[76vh]':
                        fixed,
                      'h-max min-w-fit w-max min-h-max max-w-[96vw] lg:w-full max-h-[89vh] lg:h-full':
                        !fixed,
                    }
                  )}
                >
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
