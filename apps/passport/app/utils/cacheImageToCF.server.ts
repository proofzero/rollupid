export default async (
  image_retrieval_url: string,
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

  const cacheRes = await Images.fetch('http://localhost/uploadImageBlob', {
    body: cacheReqFormData,
    method: 'post',
  })
  if (!cacheRes) throw new Error('Could not cache image.')
  const cacheResJson = await cacheRes.json<{ imageUrl: string }>()
  return cacheResJson.imageUrl
}
