import React from 'react'

export type SpinnerProps = {
  color?: string
}

export const Spinner = ({ color = '#000000' }: SpinnerProps) => (
  <div
    className="sp sp-circle animate-spin"
    style={{
      width: '32px',
      height: '32px',
      clear: 'both',
      margin: '20px 1em',
      border: '4px rgba(0, 0, 0, 0.25) solid',
      borderTop: `4px ${color} solid`,
      borderRadius: '50%',
    }}
  />
)
