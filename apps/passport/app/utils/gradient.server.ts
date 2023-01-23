import ImageClient from '@kubelt/platform-clients/image'

export const generateGradient = async (gradientSeed: string, env: Env) => {
  const client = new ImageClient(env.Images)
  return client.gradient(gradientSeed)
}
