import { useEffect } from 'react'

/**
 * This function prevents the given value from being tree-shaken out of a React component
 * by logging it to the console when the component first loads. It utilizes the useEffect
 * hook to ensure that it only runs once when the component mounts.
 *
 * Tree-shaking is an optimization process used by bundlers (like Webpack) to eliminate
 * unused code from the final bundle. By logging the value to the console, it creates
 * a side-effect that the bundler cannot safely remove, thus preventing it from being
 * tree-shaken.
 **/
export default function <T>(value: T) {
  useEffect(() => {
    if (value) {
      console.log(`Prevented ${value} from getting tree shaken`)
    }
  }, [value])
}
