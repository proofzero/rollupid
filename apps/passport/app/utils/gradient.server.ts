import ImageClient from '@kubelt/platform-clients/image'

export const generateGradient = async (gradientSeed: string) => {
  const client = new ImageClient(Images)
  return client.gradient(gradientSeed)
}
