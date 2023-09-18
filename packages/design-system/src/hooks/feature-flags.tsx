import { useEffect } from 'react'

export const registerFeatureFlag = () => {
  useEffect(() => {
    const url = new URL(window.location.href)

    const featureFlag = url.searchParams.get('feature_flag')
    if (featureFlag) {
      let featureFlags = localStorage?.getItem('feature_flags') ?? null
      if (!featureFlags) {
        featureFlags = JSON.stringify({
          [featureFlag]: true,
        })
      } else {
        featureFlags = JSON.parse(featureFlags)
        featureFlags[featureFlag] = true
        featureFlags = JSON.stringify(featureFlags)
      }

      localStorage?.setItem('feature_flags', featureFlags)

      url.searchParams.delete('feature_flag')
      history.replaceState(null, '', url.toString())
    }
  }, [])
}

export const useFeatureFlags = (
  hydrated: boolean = false
): Record<string, boolean> => {
  if (!hydrated) {
    return {}
  }

  const featureFlags = localStorage?.getItem('feature_flags')
  if (featureFlags) {
    return JSON.parse(featureFlags)
  }

  return {}
}
