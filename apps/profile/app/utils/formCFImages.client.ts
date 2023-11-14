import { FormEncType, FormMethod, SubmitFunction } from '@remix-run/react'

export const captureFormSubmitAndReplaceImages = async (
  event: React.FormEvent<HTMLFormElement>,
  submit: SubmitFunction,
  imagesUploadCallback: (isUploading: boolean) => void
) => {
  event.preventDefault()

  const form = event.currentTarget
  const action = form.action
  const method = form.method.toLowerCase()
  const encType = form.enctype.toLowerCase()

  const formData = new FormData(form)

  imagesUploadCallback(true)
  const imgUrls = await cfImgHelper(event)
  imgUrls.forEach((imgUrl) => {
    formData.set(imgUrl.name, imgUrl.url)
  })
  imagesUploadCallback(false)

  submit(formData, {
    action,
    method: method as FormMethod,
    encType: encType as FormEncType,
  })
}

const cfImgHelper = async (event: React.FormEvent<HTMLFormElement>) => {
  const getFilteredFileInputs = (formElement: HTMLFormElement) => {
    return Array.from(formElement.querySelectorAll('input[type="file"]'))
      .map((input) => input as HTMLInputElement)
      .filter(
        (input) =>
          input.dataset.name &&
          input.dataset.variant &&
          input.files &&
          input.files[0]
      )
      .map((input) => ({
        name: input.dataset.name!,
        variant: input.dataset.variant!,
        file: input.files![0],
      }))
  }

  const getUploadUrl = async () => {
    const response = await fetch('/account/profile/image-upload-url', {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to retrieve the image upload URL.')
    }
    return response.json<string>()
  }

  const uploadFile = async (file: File, uploadUrl: string) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error('Failed to upload the image.')
    }
    return response.json<{
      result: {
        variants: string[]
      }
    }>()
  }

  const extractVariantUrl = (
    uploadResponse: {
      result: {
        variants: string[]
      }
    },
    variant: string
  ) => {
    const variantUrl = uploadResponse.result.variants.find((v) =>
      v.endsWith(variant)
    )
    if (!variantUrl) {
      throw new Error(`No URL found for variant: ${variant}`)
    }
    return variantUrl
  }

  const formElement = event.currentTarget
  const filteredFileInputs = getFilteredFileInputs(formElement)

  const imgUploadUrl = await getUploadUrl()
  const fileUrls = await Promise.all(
    filteredFileInputs.map(async ({ file, variant, name }) => {
      const uploadResponse = await uploadFile(file, imgUploadUrl)
      return {
        name,
        url: extractVariantUrl(uploadResponse, variant!),
      }
    })
  )

  return fileUrls
}
