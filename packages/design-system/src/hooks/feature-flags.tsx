import { useEffect } from 'react'

// Automatically called once on component mount due to useEffect with an empty dependency array.
export const registerFeatureFlag = () => {
  useEffect(() => {
    const url = new URL(window.location.href)
    const featureFlag = url.searchParams.get('feature_flag')

    if (featureFlag) {
      // Retrieve existing feature flags from localStorage or initialize to null
      let featureFlags = localStorage?.getItem('feature_flags') ?? null

      // Update the feature flags object and store it back in localStorage
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
