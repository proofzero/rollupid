/**
 * @file app/shared/components/IconPicker/index.tsx
 */

import { useEffect, useState } from 'react'
import { Text } from '@proofzero/design-system'

import { CameraIcon } from '@heroicons/react/24/outline'

// pickIcon
// -----------------------------------------------------------------------------

function pickIcon(
  setIcon: React.Dispatch<React.SetStateAction<string>>,
  setIconUrl: React.Dispatch<React.SetStateAction<string>>,
  maxImgSize = 1048576,
  aspectRatio?: {
    width: number
    height: number
  },
  minWidth?: number,
  minHeight?: number,
  variant: string = 'public'
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
            setIcon(e?.target?.result as string)
          }
          reader.readAsDataURL(iconFile)

          const imgUploadUrl = (await fetch('/api/image-upload-url', {
            method: 'post',
          }).then((res) => {
            return res.json()
          })) as string

          const formData = new FormData()
          formData.append('file', iconFile)

          const cfUploadRes: {
            success: boolean
            result: {
              variants: string[]
            }
          } = await fetch(imgUploadUrl, {
            method: 'POST',
            body: formData,
          }).then((res) => res.json())

          const variantUrls = cfUploadRes.result.variants.filter((v) =>
            v.endsWith(variant)
          )

          if (variantUrls.length) {
            setIconUrl(variantUrls[0])
          }
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
  variant,
}: IconPickerProps) {
  const [icon, setIcon] = useState<string>('')
  const [iconUrl, setIconUrl] = useState<string>('')
  const [invalidState, setInvalidState] = useState(invalid)
  const [errorMessageState, setErrorMessageState] = useState(errorMessage)

  useEffect(() => {
    setIconUrl(url !== undefined ? url : '')
    setIcon(url !== undefined ? url : '')
    setInvalidState(undefined)
    setErrorMessageState(undefined)
  }, [url])

  useEffect(() => {
    if (!iconUrl) return

    imageUploadCallback(iconUrl)
  }, [iconUrl])

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = [...e.dataTransfer.files]
    if (files && files.length > 0) {
      const file = files.pop()
      if (!file) return

      // Ignore dropped files that aren't images.
      if (!file.type.startsWith('image/')) {
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (!e.target) return
        // Set the data URL as the <img src="..."/> value.
        setIcon(e.target.result as string)
      }
      // Read file as data URL, triggering onload handler.
      reader.readAsDataURL(file)

      e.dataTransfer.clearData()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const appIcon =
    icon !== '' ? (
      <img className="rounded" src={icon} alt="Application icon" />
    ) : (
      <CameraIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
    )

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
      {id && <input type="hidden" name={id} value={iconUrl} />}
      <div className="flex flex-col md:flex-row md:gap-4 items-center">
        <div className="flex flex-row gap-4">
          <div
            className={`grid place-items-center bg-[#F3F4F6] rounded`}
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
            onDrop={(e) => handleDrop(e)}
            onDragOver={(e) => handleDragOver(e)}
            onDragEnter={(e) => handleDragEnter(e)}
            onDragLeave={(e) => handleDragLeave(e)}
          >
            {appIcon}
          </div>

          <div className="grid place-items-center">
            <label
              htmlFor="icon-upload"
              className={`rounded bg-transparent text-sm border
                 py-2 px-4 hover:bg-gray-100
               focus:bg-indigo-400 hover:cursor-pointer
                ${invalid ? 'border-red-400' : 'border-gray-300'}`}
            >
              <Text type="span" size="xs">
                Upload
              </Text>
              <input
                type="file"
                id="icon-upload"
                name="icon"
                accept="image/png,image/jpeg,image/gif,image/webp"
                className="sr-only"
                onChange={async (event) => {
                  event.stopPropagation()
                  setIsFormChanged(false)
                  setIsImgUploading(true)
                  const errors = await pickIcon(
                    setIcon,
                    setIconUrl,
                    maxSize,
                    aspectRatio,
                    minWidth,
                    minHeight,
                    variant
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
