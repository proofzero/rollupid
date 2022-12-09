import React, { HTMLAttributes } from 'react'
import classNames from 'classnames'

export type ModalProps = HTMLAttributes<HTMLDivElement> & {}

export function Modal({ children, ...rest }: ModalProps) {
  return <div>{children}</div>
}
