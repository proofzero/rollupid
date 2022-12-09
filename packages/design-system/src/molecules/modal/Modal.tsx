import React, { Fragment, HTMLAttributes } from 'react'
import classNames from 'classnames'
import { Dialog, Transition } from '@headlessui/react'

import { HiOutlineX } from 'react-icons/hi'

export type ModalProps = HTMLAttributes<HTMLDivElement> & {
  fixed?: boolean
  isOpen: boolean
  handleClose?: (value: boolean) => void
}

export function Modal({
  isOpen = false,
  fixed = false,
  handleClose,
  children,
  ...rest
}: ModalProps) {
  console.log({ isOpen })

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
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
          <div className="flex min-h-full items-center justify-center p-2 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel>
                <div
                  className={`flex flex-col ${
                    fixed
                      ? `w-[96vw] lg:w-[50vw] h-[96vh] lg:h-[76vh]`
                      : `max-w-[96vw] lg:max-w-[50vw] max-h-[89vh] lg:max-h-76vh`
                  }`}
                >
                  <div className="flex flex-row justify-end p-3">
                    <div
                      className="bg-white rounded-full p-2 text-3xl cursor-pointer"
                      onClick={() => {
                        if (handleClose) handleClose(false)
                      }}
                    >
                      <HiOutlineX />
                    </div>
                  </div>

                  <div className="flex-1 relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6 overflow-y-auto">
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
