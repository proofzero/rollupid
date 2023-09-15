export type FeatureFlags = {
  [key: string]: boolean
}

export const parseFeatureFlags = (env: unknown): FeatureFlags => {
  const castEnv = env as {
    [key: string]: string
  }

  const envFeatureFlags = castEnv.FEATURE_FLAGS
  if (!envFeatureFlags) {
    console.warn('No feature flags found in env, using empty object')

    return {}
  }

  const featureFlags: FeatureFlags = {}
  envFeatureFlags.split(',').forEach((flag) => {
    featureFlags[flag] = true
  })

  return featureFlags
}
