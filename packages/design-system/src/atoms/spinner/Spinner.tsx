import React from 'react'

export type SpinnerProps = {
  color?: string
  size?: number
  margin?: string
  weight?: 'slim' | 'bold'
}

export const Spinner = ({
  color = '#000000',
  size = 32,
  margin = 'auto',
  weight = 'bold',
}: SpinnerProps) => (
  <div
    className="sp sp-circle animate-spin"
    style={{
      width: size,
      height: size,
      clear: 'both',
      border: `${Math.floor(
        size / (weight === 'bold' ? 4 : 6)
      )}px rgba(0, 0, 0, 0.25) solid`,
      borderTop: `${Math.floor(
        size / (weight === 'bold' ? 4 : 6)
      )}px ${color} solid`,
      borderRadius: '50%',
      margin,
    }}
  />
)
