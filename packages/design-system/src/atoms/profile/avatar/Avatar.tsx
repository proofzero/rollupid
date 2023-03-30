import React, { HTMLAttributes } from 'react'

import classNames from 'classnames'

const hexStyle = {
  clipPath:
    'polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)',
}

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src: string
  hex?: boolean
  border?: boolean
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg'
}

export const Avatar = ({
  hex = false,
  border = false,
  src,
  size = 'md',
  className,
  style,
  ...rest
}: AvatarProps) => {
  return (
    <div
      className={classNames(
        { 'bg-white z-[100]': border },
        { 'w-12 h-12': size === 'xs' },
        { 'w-16 h-16': size === 'sm' },
        { 'w-40 h-40': size === 'md' },
        { 'w-48 h-48': size === 'lg' },
        { 'rounded-full': !hex },
        className
      )}
      style={
        hex
          ? {
              ...hexStyle,
              ...style,
            }
          : {
              transform: 'scale(0.9)',
              ...style,
            }
      }
      {...rest}
    >
      <img
        src={src}
        className={classNames(
          'bg-white object-cover',
          { 'border-white': border },
          { border: border && size === 'sm' }, // TODO: what is the xs border?
          { 'border-4': border && size === 'md' },
          { 'border-8': border && size === 'lg' },
          { 'w-10 h-10': size === '2xs' },
          { 'w-12 h-12': size === 'xs' },
          { 'w-16 h-16': size === 'sm' },
          { 'w-40 h-40': size === 'md' },
          { 'w-48 h-48': size === 'lg' },
          { 'rounded-full': !hex }
        )}
        style={
          hex
            ? {
                transform: 'scale(0.9)',
                ...hexStyle,
              }
            : undefined
        }
      />
    </div>
  )
}
