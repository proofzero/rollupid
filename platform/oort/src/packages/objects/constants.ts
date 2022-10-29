import { IndexRecord } from './types'

export const VISIBILITY = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
}

export const DEFAULT_INDEX_RECORD: IndexRecord = {
  version: 0,
  visibility: VISIBILITY.PRIVATE,
}
