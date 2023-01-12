export const generateGradient = async (gradientSeed: string) => {
  return await Images.fetch(`http://localhost/gradient/${gradientSeed}`, {
    cf: {
      cacheEverything: true,
      cacheTtl: 86400,
      cacheKey: gradientSeed,
    },
  })
    .then((res) => res.text())
    .catch((err) => {
      console.debug("Couldn't fetch ogImage", err)
      return '' // TODO: what is our default?
    })
}
