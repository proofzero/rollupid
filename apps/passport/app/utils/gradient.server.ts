export const generateGradient = async (gradientSeed: string) => {
  const res = await Images.fetch(`http://localhost/gradient/${gradientSeed}`, {
    cf: {
      cacheEverything: true,
      cacheTtl: 86400,
      cacheKey: gradientSeed,
    },
  })
    .then((res) => {
      return res.text()
    })
    .catch((err) => {
      console.error("Couldn't fetch ogImage", err)
      return '' // TODO: what is our default?
    })
  return res
}
