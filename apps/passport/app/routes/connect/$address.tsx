import React from 'react'
import { Suspense } from 'react'

const LazyAuth = React.lazy(() =>
  import('~/web3/lazyAuth').then((module) => ({ default: module.LazyAuth }))
)

export default () => {
  return (
    <Suspense fallback={/*Show some spinner*/ ''}>
      <LazyAuth />
    </Suspense>
  )
}
