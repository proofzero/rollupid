import createImageClient from '@kubelt/platform-clients/image'

function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

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

  const arrayBuffer = await retrievedImage.arrayBuffer()
  const b64AB = arrayBufferToBase64(arrayBuffer)

  if (!b64AB) {
    throw new Error('Error converting image blob to b64')
  }

  const imageClient = createImageClient(env.Images)
  const imageUrl = await imageClient.uploadImageBlob.mutate({
    b64: b64AB,
  })

  if (!imageUrl || !imageUrl.length) throw new Error('Could not cache image.')

  return imageUrl
}
