import {describe, expect, test} from '@jest/globals'

import {
  isEmptyObject,
} from '../src/schema/resolvers/utils'

describe('Galaxy smoke tests', () => {
  console.log('Please run the platform locally (`yarn dev` in `platform/`)')
  test('adds 1 + 2 to equal 3', async () => {
    expect(1 + 2).toBe(3);
  })
})

describe('Galaxy unit tests', () => {
  test('isEmptyObject unhappy paths', async () => {
    expect(isEmptyObject(null)).toBe(false)
    expect(isEmptyObject(undefined)).toBe(false)
    expect(isEmptyObject({ msg: 'I am a full object' })).toBe(false)
  })

  test('isEmptyObject happy paths', async () => {
    expect(isEmptyObject({})).toBe(true)
  })
})
