import createImagesClient from '@kubelt/platform-clients/image'

export const generateGradient = async (gradientSeed: string, env: Env) => {
  const imagesClient = createImagesClient(env.Images)
  const gradient = imagesClient.getGradient.mutate({ gradientSeed })
  return gradient
}
