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

  const blob = await retrievedImage.blob()
  const cacheReqFormData = new FormData()
  cacheReqFormData.append('imageBlob', blob)

  const imageClient = createImageClient(env.Images)
  const imageUrl = await imageClient.uploadImageBlob.mutate({ blob })

  if (!imageUrl || !imageUrl.length) throw new Error('Could not cache image.')

  return imageUrl
}
