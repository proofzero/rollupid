import createImageClient from '@proofzero/platform-clients/image'
import {
  generateTraceContextHeaders,
  TraceSpan,
} from '@proofzero/platform-middleware/trace'

export const ogImageFromProfile = async (
  pfp: string,
  env: Env,
  traceSpan: TraceSpan
) => {
  const imageClient = createImageClient(env.Images, {
    imagesURL: env.IMAGES_URL,
    headers: generateTraceContextHeaders(traceSpan),
  })
  const ogImage = await imageClient.getOgImage.query({
    fgUrl: pfp,
  })
  return ogImage
}
