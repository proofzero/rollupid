import createImageClient from '@kubelt/platform-clients/image'

export default async (
  image_retrieval_url: string,
  env: Env,
  headers?: Record<string, string>
): Promise<string> => {
  const retrieveImageReq = fetch(image_retrieval_url, {
    headers: headers,
    method: 'get',
  })
  const retrievedImage = await retrieveImageReq

  if (!retrievedImage.ok) {
    if (retrievedImage.status === 404) {
      //Valid error
      console.error('No image found in at that URL.')
      return ''
    } else {
      console.error(
        'Error retrieving the image from URL.',
        retrievedImage.statusText
      )
      throw new Error('Error retrieving the image from URL')
    }
  }

  const imgFile = await retrievedImage.blob()

  const imageClient = createImageClient(env.Images)
  const { uploadURL } = await imageClient.upload.mutate()

  const formData = new FormData()
  formData.append('file', imgFile)
  let cfUploadRes: {
    success: boolean
    result: {
      variants: string[]
    }
  } | null = null

  try {
    cfUploadRes = await fetch(uploadURL, {
      method: 'POST',
      body: formData,
    }).then((res) => res.json())

    if (!cfUploadRes?.success || !cfUploadRes.result?.variants)
      throw new Error('Upload failed')
  } catch (ex) {
    console.error('Could not send upload image blob to Image cache.', ex)
    return ''
  }

  const imageURL = cfUploadRes?.result.variants[0]

  if (!imageURL || !imageURL.length) throw new Error('Could not cache image.')

  return imageURL
}
