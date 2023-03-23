import React from 'react'

export type SpinnerProps = {
  color?: string
  size?: number
}

export const Spinner = ({ color = '#000000', size = 32 }: SpinnerProps) => (
  <div
    className="sp sp-circle animate-spin"
    style={{
      width: size,
      height: size,
      clear: 'both',
      border: `${size / 4}px rgba(0, 0, 0, 0.25) solid`,
      borderTop: `${size / 4}px ${color} solid`,
      borderRadius: '50%',
    }}
  />
)
