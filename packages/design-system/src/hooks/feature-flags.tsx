import { useEffect } from 'react'

const retiredFeatureFlags = ['seats']

// Automatically called once on component mount due to useEffect with an empty dependency array.
export const registerFeatureFlag = () => {
  useEffect(() => {
    let lsFeatureFlags: string | Record<string, boolean> | null =
      localStorage?.getItem('feature_flags') ?? null
    if (lsFeatureFlags) {
      lsFeatureFlags = JSON.parse(lsFeatureFlags) as Record<string, boolean>
      retiredFeatureFlags.forEach((flag) => {
        if (lsFeatureFlags[flag]) {
          delete lsFeatureFlags[flag]
        }
      })
      if (Object.keys(lsFeatureFlags).length === 0) {
        lsFeatureFlags = null
        localStorage?.removeItem('feature_flags')
      } else {
        lsFeatureFlags = JSON.stringify(lsFeatureFlags)
        localStorage?.setItem('feature_flags', lsFeatureFlags as string)
      }
    }

    const url = new URL(window.location.href)
    const featureFlag = url.searchParams.get('feature_flag')
    if (featureFlag) {
      // Update the feature flags object and store it back in localStorage
      if (!lsFeatureFlags) {
        lsFeatureFlags = JSON.stringify({
          [featureFlag]: true,
        })
      } else {
        lsFeatureFlags = JSON.parse(lsFeatureFlags as string)
        lsFeatureFlags[featureFlag] = true
        lsFeatureFlags = JSON.stringify(lsFeatureFlags)
      }

      localStorage?.setItem('feature_flags', lsFeatureFlags)

      // Clean up the URL by removing the 'feature_flag' query parameter
      url.searchParams.delete('feature_flag')
      history.replaceState(null, '', url.toString())
    }
  }, [])
}

// Retrieves feature flags from localStorage, assuming the client-side is "hydrated"
export const useFeatureFlags = (hydrated = false) => {
  // Return an empty object if local storage is not initialized
  if (!hydrated) return {}

  // Retrieve and parse the feature flags from localStorage, if they exist
  const featureFlags = localStorage?.getItem('feature_flags')
  return featureFlags ? JSON.parse(featureFlags) : {}
}
