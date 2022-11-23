import tap from 'tap'

import {
    isEmptyObject
} from '../src/schema/resolvers/utils'

tap.test('isEmptyObject unhappy path', async (t) => {
    t.equal(isEmptyObject({ name: 'full object' }), false)
    t.equal(isEmptyObject(undefined), false)
    t.equal(isEmptyObject(null), false)
    t.end()
})

tap.test('isEmptyObject happy path', async (t) => {
    t.equal(isEmptyObject({}), true)
    t.end()
})