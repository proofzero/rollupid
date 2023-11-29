/**
 * @file app/shared/components/IconPicker/index.tsx
 */
import React from 'react'

import { useEffect, useState } from 'react'
import { Text } from '../text/Text'

import { CameraIcon } from '@heroicons/react/24/outline'

// pickIcon
// -----------------------------------------------------------------------------

function pickIcon(
  setLocalIconURL: React.Dispatch<React.SetStateAction<string>>,
  maxImgSize = 1048576,
  aspectRatio?: {
    width: number
    height: number
  },
  minWidth?: number,
  minHeight?: number
) {
  return (e: any) =>
    new Promise<any>(async (ok) => {
      // e.target is the input control that trigger the event.
      const files = e.target.files
      const errors: any = {}

      if (!files || files.length === 0) {
        ok(errors)
      }

      if (files[0].size >= maxImgSize) {
        errors['imgSize'] = `Image size limit is ${Math.floor(
          maxImgSize / 1024 / 1024
        )}MB`
      }

      // Check image width and height
      const img = new Image()
      img.src = URL.createObjectURL(files[0])
      img.onload = async () => {
        if (
          aspectRatio &&
          img.width / img.height !== aspectRatio.width / aspectRatio.height
        ) {
          errors[
            'imgAR'
          ] = `Image aspect ratio must be ${aspectRatio.width}:${aspectRatio.height}`
        }

        if (minWidth && img.width < minWidth) {
          errors['imgMinW'] = `Image width must be at least ${minWidth}px`
        }

        if (minHeight && img.height < minHeight) {
          errors['imgMinH'] = `Image height must be at least ${minHeight}px`
        }

        if (files && files.length > 0 && !Object.keys(errors).length) {
          // FileList is *like* an Array but you can't pop().
          const iconFile = files.item(0)
          const reader = new FileReader()
          reader.onload = (e) => {
            setLocalIconURL(e?.target?.result as string)
          }
          reader.readAsDataURL(iconFile)
        }

        ok(errors)
      }
    })
}

// IconPicker
// -----------------------------------------------------------------------------

type IconPickerProps = {
  label?: string
  /**
   * Maximum image size in bytes.
   */
  maxSize?: number
  /**
   * Aspect ratio of the image.
   */
  aspectRatio?: {
    width: number
    height: number
  }
  minWidth?: number
  minHeight?: number
  id?: string
  // URL of an existing icon.
  url?: string
  // Is picker in invalid state?
  invalid?: boolean
  // An error message to display
  errorMessage?: string
  setIsFormChanged: (val: boolean) => void
  setIsImgUploading: (val: boolean) => void
  imageUploadCallback?: (url: string) => void
  variant?: string
}

export default function IconPicker({
  label,
  maxSize,
  aspectRatio,
  minWidth,
  minHeight,
  id,
  url,
  invalid,
  errorMessage,
  setIsFormChanged,
  setIsImgUploading,
  imageUploadCallback = () => {},
  variant = 'public',
}: IconPickerProps) {
  const [iconURL, setIconURL] = useState<string>('')
  const [invalidState, setInvalidState] = useState(invalid)
  const [errorMessageState, setErrorMessageState] = useState(errorMessage)

  useEffect(() => {
    setIconURL(url !== undefined ? url : '')
    setInvalidState(undefined)
    setErrorMessageState(undefined)
  }, [url])

  useEffect(() => {
    if (!iconURL) return

    imageUploadCallback(iconURL)
  }, [iconURL])

  const calculateDimensions = (
    aspectRatioWidth: number,
    aspectRatioHeight: number,
    maxSize: number = 64
  ) => {
    let width: number
    let height: number

    if (aspectRatioWidth > aspectRatioHeight) {
      width = maxSize
      height = (aspectRatioHeight / aspectRatioWidth) * maxSize
    } else {
      height = maxSize
      width = (aspectRatioWidth / aspectRatioHeight) * maxSize
    }

    return { width, height }
  }

  const { width, height } = aspectRatio
    ? calculateDimensions(aspectRatio.width, aspectRatio.height, 64)
    : { width: 64, height: 64 }

  return (
    <div>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="flex flex-col md:flex-row md:gap-4 items-center">
        <div className="flex flex-row gap-4">
          <div
            className={`grid place-items-center bg-[#F3F4F6] rounded`}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundImage:
                iconURL && iconURL !== '' ? `url(${iconURL})` : '',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          >
            {(!iconURL || iconURL === '') && (
              <CameraIcon
                className="h-6 w-6 text-gray-300"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="grid place-items-center">
            <label
              htmlFor={`${id}_file`}
              className={`rounded bg-transparent text-sm border
                 py-2 px-4 hover:bg-gray-100
               focus:bg-indigo-400 hover:cursor-pointer
                ${invalid ? 'border-red-400' : 'border-gray-300'}`}
            >
              <Text type="span" size="xs">
                Upload
              </Text>
              {iconURL && <input type="hidden" name={id} value={iconURL} />}
              <input
                type="file"
                id={`${id}_file`}
                name={`${id}_file`}
                data-variant={variant}
                data-name={id}
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="sr-only"
                onChange={async (event) => {
                  event.stopPropagation()
                  setIsFormChanged(false)
                  setIsImgUploading(true)
                  const errors = await pickIcon(
                    setIconURL,
                    maxSize,
                    aspectRatio,
                    minWidth,
                    minHeight
                  )(event)
                  if (Object.keys(errors).length) {
                    setInvalidState(true)
                    setErrorMessageState(errors[Object.keys(errors)[0]])
                  } else {
                    setInvalidState(false)
                  }
                  setIsImgUploading(false)
                  setIsFormChanged(true)
                }}
              />
            </label>
          </div>
        </div>
        {invalidState && (
          <Text
            className="text-red-500"
            size="xs"
            weight="normal"
            id="icon-error"
          >
            {errorMessageState}
          </Text>
        )}
      </div>
    </div>
  )
}
