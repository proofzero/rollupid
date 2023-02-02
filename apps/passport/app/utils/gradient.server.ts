import createImageClient from '@kubelt/platform-clients/image'

export const generateGradient = async (gradientSeed: string, env: Env) => {
  const imageClient = createImageClient(env.Images)
  const gradient = imageClient.getGradient.mutate({ gradientSeed })
  return gradient
}
