import createImageClient from '@kubelt/platform-clients/image'

const blobToB64 = (blob: Blob): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(blob)
  })

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
  const b64Blob = await blobToB64(blob)

  if (!b64Blob) {
    throw new Error('Error converting image blob to b64')
  }

  const imageClient = createImageClient(env.Images)
  const imageUrl = await imageClient.uploadImageBlob.mutate({
    blob: b64Blob?.toString(),
  })

  if (!imageUrl || !imageUrl.length) throw new Error('Could not cache image.')

  return imageUrl
}
