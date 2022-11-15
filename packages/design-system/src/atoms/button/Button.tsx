import React, { ReactNode, useRef } from 'react'
import classNames from 'classnames'
import styled from 'styled-components'

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color, #6c5ce7);
  border-radius: 8px;
  border: 1px solid var(--primary-color, #6c5ce7);
  color: var(--on-primary-color, #fff);
  cursor: pointer;
  text-decoration: none;
  transition: background-color 300ms ease-in-out;
  padding: 12px 45px;
  font-weight: 500;
  size: 16px;
  line-height: 24px;

  &:hover {
    background-color: #3e29df;
  }
  &:focus {
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 2px #fff,
      0px 0px 0px 4px #6366f1;
  }
  &.primary {
    background-color: #1f2937;
    border: 1px solid transparent;
  }
  &.primary:hover {
    background-color: #374151;
  }
  &.primary:focus {
    background-color: #1f2937;
  }
  &.secondary {
    color: #1f2937;
    background-color: #f3f4f6;
    border: 1px solid transparent;
  }
  &.secondary:hover {
    background-color: #e5e7eb;
  }
  &.secondary:focus {
    background-color: #f3f4f6;
  }
  &.tertiary {
    background-color: white;
    border: 1px solid #d1d5db;
    color: #1f2937;
  }
  &.tertiary:focus {
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05), 0px 0px 0px 2px #f3f4f6,
      0px 0px 0px 4px #e5e7eb;
  }
  &.tertiary:hover {
    background-color: white;
  }
  &.alt {
    background-color: #6366f1;
    color: white;
  }
  &.alt:focus {
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  }
  &.alt:hover {
    background-color: #6366f1;
  }
  &.disabled {
    background: #f3f4f6;
    color: #d1d5db;
  }
  &.disabled:focus {
    box-shadow: none;
  }
  &.xs {
    padding: 7px 11px;
    height: 48px;
    width: 108px;
  }
  &.sm {
    padding: 9px 13px;
    height: 48px;
    width: 135px;
  }
  &.md {
    padding: 9px 17px;
    height: 48px;
    width: 168px;
  }
  &.lg {
    padding: 9px 17px;
    height: 48px;
    width: 201px;
  }
  &.xl {
    padding: 13px 25px;
    height: 48px;
    width: 241px;
  }
`

export type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ButtonProps = {
  disabled?: boolean
  alt?: boolean
  secondary?: boolean
  tertiary?: boolean
  size?: Sizes
  className?: string
  children?: ReactNode
  onClick?: () => void
}

export function Button({
  disabled,
  alt,
  secondary,
  tertiary,
  size,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const altClass = alt ? 'alt' : 'primary'
  const secondaryClass = secondary ? 'secondary' : 'primary'
  const tertiaryClass = tertiary ? 'tertiary' : ''
  const disabledClass = disabled ? 'disabled' : ''
  const sizeClass = size ? size : 'md'

  return (
    <StyledButton
      {...rest}
      disabled={disabled}
      className={classNames(
        'button',
        'base',
        className,
        altClass,
        secondaryClass,
        tertiaryClass,
        disabledClass,
        sizeClass
      )}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  )
}
