/**
 * @file app/shared/components/IconPicker/index.tsx
 */

import { useState } from 'react'
import { Text } from '@proofzero/design-system'

import { CameraIcon } from '@heroicons/react/24/outline'

// pickIcon
// -----------------------------------------------------------------------------

function pickIcon(setIcon, setIconUrl) {
  return async (e) => {
    // e.target is the input control that trigger the event.
    const files = e.target.files
    const errors: any = {}

    if (files[0].size >= 1048576) {
      errors['imgSize'] = 'Image size limit is 1MB'
    }

    if (files && files.length > 0 && !Object.keys(errors).length) {
      // FileList is *like* an Array but you can't pop().
      const iconFile = files.item(0)
      const reader = new FileReader()
      reader.onload = (e) => {
        setIcon(e?.target?.result)
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

      const publicVariantUrls = cfUploadRes.result.variants.filter((v) =>
        v.endsWith('public')
      )

      if (publicVariantUrls.length) {
        setIconUrl(publicVariantUrls[0])
      }
    }
    return errors
  }
}

// IconPicker
// -----------------------------------------------------------------------------

type IconPickerProps = {
  id?: string
  // URL of an existing icon.
  url?: string
  // Is picker in invalid state?
  invalid?: boolean
  // An error message to display
  errorMessage?: string
  setIsFormChanged: (val: boolean) => void
  setIsImgUploading: (val: boolean) => void
}

export default function IconPicker({
  id,
  url,
  invalid,
  errorMessage,
  setIsFormChanged,
  setIsImgUploading,
}: IconPickerProps) {
  const [icon, setIcon] = useState(url !== undefined ? url : '')
  const [iconUrl, setIconUrl] = useState(url !== undefined ? url : '')
  const [invalidState, setInvalidState] = useState(invalid)
  const [errorMessageState, setErrorMessageState] = useState(errorMessage)

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const files = [...e.dataTransfer.files]
    if (files && files.length > 0) {
      const file = files.pop()
      // Ignore dropped files that aren't images.
      if (!file.type.startsWith('image/')) {
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        // Set the data URL as the <img src="..."/> value.
        setIcon(e.target.result)
      }
      // Read file as data URL, triggering onload handler.
      reader.readAsDataURL(file)

      e.dataTransfer.clearData()
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const appIcon =
    icon !== '' ? (
      <img className="rounded" src={icon} alt="Application icon" />
    ) : (
      <CameraIcon className="h-6 w-6 text-gray-300" aria-hidden="true" />
    )

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        Upload Icon* (256x256)
      </label>
      {id && <input type="hidden" name={id} value={iconUrl} />}
      <div className="flex flex-col md:flex-row md:gap-4 items-center mt-2">
        <div className="flex flex-row gap-4">
          <div
            className="grid w-[64px] h-[64px] place-items-center bg-[#F3F4F6] rounded"
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
              <span>Upload</span>
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
                  const errors = await pickIcon(setIcon, setIconUrl)(event)
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