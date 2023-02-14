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

  try {
    const imgFile = await retrievedImage.blob()

    const imageClient = createImageClient(env.Images)
    const { uploadURL } = await imageClient.upload.mutate()

    const formData = new FormData()
    formData.append('file', imgFile)

    const cfUploadRes: {
      success: boolean
      result: {
        variants: string[]
      }
    } = await fetch(uploadURL, {
      method: 'POST',
      body: formData,
    }).then((res) => res.json())

    const imageURL = cfUploadRes.result.variants[0]

    if (!imageURL || !imageURL.length) throw new Error('Could not cache image.')

    return imageURL
  } catch (ex) {
    console.error('Could not send upload image blob to Image cache.', ex)
    return ''
  }
}
