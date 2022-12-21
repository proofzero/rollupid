import { HTMLAttributes, useEffect, useState } from 'react'

import classNames from 'classnames'

import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

export type CoverProps = HTMLAttributes<HTMLDivElement> & {
  src: string | undefined
}

export const Cover = ({ src, className, children, ...rest }: CoverProps) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)

    if (!src) {
      return
    }

    const img = new Image()
    img.onload = () => {
      setLoaded(true)
    }

    img.src = src
  }, [src])

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
