import React, { HTMLAttributes } from 'react'

import classNames from 'classnames'

import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

export type CoverProps = HTMLAttributes<HTMLDivElement> & {
  src: string | undefined
  loaded?: boolean
}

export const Cover = ({
  loaded = true,
  src,
  className,
  children,
  ...rest
}: CoverProps) => {
  return (
    <div
      className={classNames(
        'h-[300px] w-full relative rounded-b-xl',
        className
      )}
      style={{
        backgroundImage: src ? `url(${src})` : undefined,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
      {...rest}
    >
      {!loaded && (
        <div className="absolute flex left-0 right-0 top-0 bottom-0 justify-center items-center">
          <Spinner color="#ffffff" />
        </div>
      )}

      {loaded && children}
    </div>
  )
}
