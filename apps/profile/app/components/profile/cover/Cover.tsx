import type { HTMLAttributes } from 'react'
import { useRef } from 'react'
import { useEffect, useState } from 'react'

import classNames from 'classnames'
import { FaCamera, FaTrash } from 'react-icons/fa'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

export type CoverProps = HTMLAttributes<HTMLDivElement> & {
  src: string | undefined
  isOwner?: boolean
  updateCoverHandler?: (file: string) => Promise<void>
}

export const Cover = ({
  src,
  children,
  isOwner,
  updateCoverHandler,
  ...rest
}: CoverProps) => {
  const [loaded, setLoaded] = useState(false)
  const [handlingCover, setHandlingCover] = useState<boolean>(false)

  const coverUploadRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoaded(false)

    if (!src) {
      setLoaded(true)
      setHandlingCover(false)
      return
    }

    const img = new Image()
    img.onload = () => {
      setLoaded(true)
    }

    img.src = src
    setHandlingCover(false)
  }, [src])

  return (
    <div
      className={classNames(
        `max-w-4xl mx-auto flex justify-center`,
        'h-48 w-full relative rounded-b-xl',
        `${!handlingCover ? 'hover-child-visible' : ''}`
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

      {loaded && isOwner && typeof updateCoverHandler !== 'undefined' && (
        <div
          className="absolute top-0 left-0 right-0 bottom-0 flex
          justify-center items-center bg-gray-800/25 rounded-b-xl"
        >
          <input
            ref={coverUploadRef}
            type="file"
            id="pfp-upload"
            name="pfp"
            accept="image/png, image/jpeg"
            className="sr-only"
            onChange={async (e: any) => {
              setHandlingCover(true)

              const coverFile = (
                e.target as HTMLInputElement & EventTarget
              ).files?.item(0)
              if (!coverFile) {
                return
              }

              const formData = new FormData()
              formData.append('file', coverFile)

              const imgUploadUrl = (await fetch(
                '/account/settings/profile/image-upload-url',
                {
                  method: 'post',
                }
              ).then((res) => res.json())) as string

              const cfUploadRes: {
                success: boolean
                result: {
                  variants: string[]
                }
              } = await fetch(imgUploadUrl, {
                method: 'POST',
                body: formData,
              }).then((res) => res.json())

              const publicVariantUrls = cfUploadRes.result.variants.filter(
                (v) => v.endsWith('public')
              )

              if (publicVariantUrls.length) {
                updateCoverHandler(publicVariantUrls[0])
              }
            }}
          />

          {handlingCover && <Spinner color="#ffffff" />}

          {!handlingCover && (
            <div className="flex flex-row space-x-4 items-center -mt-16">
              {src && (
                <Button
                  btnType={'primary'}
                  btnSize={'sm'}
                  onClick={() => {
                    setHandlingCover(true)
                    updateCoverHandler('')
                  }}
                  className="flex flex-row space-x-3 justify-center items-center"
                  style={{
                    opacity: 0.8,
                  }}
                >
                  <FaTrash className="text-sm" />

                  <Text type="span" size="sm">
                    Delete
                  </Text>
                </Button>
              )}

              <Button
                btnType={'primary'}
                btnSize={'sm'}
                onClick={() => {
                  coverUploadRef.current?.click()
                }}
                className="flex flex-row space-x-3 justify-center items-center"
                style={{
                  opacity: 0.8,
                }}
              >
                <FaCamera className="text-sm" />

                <Text type="span" size="sm">
                  Upload
                </Text>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
