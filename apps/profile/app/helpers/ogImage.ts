import createImageClient from '@kubelt/platform-clients/image'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@kubelt/platform-middleware/trace'

export const ogImageFromProfile = async (pfp: string, traceSpan: TraceSpan) => {
  const imageClient = createImageClient(Images, {
    imagesURL: IMAGES_URL,
    headers: generateTraceContextHeaders(traceSpan),
  })
  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}
