import _ from 'lodash'
import { Methods } from '@open-rpc/meta-schema'

import { Context } from '../../types'
import JSONRPC, { MethodMap } from '../../jsonrpc'

import methodObjects from './methods'

import { DEFAULT_INDEX_RECORD, VISIBILITY } from './constants'

import {
  IndexRecord,
  GetObjectParams,
  GetObjectResult,
  ObjectValue,
  PutObjectParams,
  PutObjectResult,
} from './types'

import { getBaseKey, getIndexKey, getObjectKey } from './utils'

export default class Objects extends JSONRPC {
  getMethodMap(): MethodMap {
    return super.getMethodMap({
      kb_getObject: 'getObject',
      kb_putObject: 'putObject',
    })
  }

  getMethodObjects(): Methods {
    return super.getMethodObjects(methodObjects)
  }

  async getObject(
    params: GetObjectParams,
    context: Context
  ): Promise<GetObjectResult> {
    const { OBJECTS } = this.core.env
    const [namespace, path, options] = params

    const baseKey = getBaseKey(namespace, path)
    const indexKey = getIndexKey(baseKey)
    const indexRecord = await this.getIndexRecord(indexKey)
    const { version, visibility } = indexRecord

    if (visibility != VISIBILITY.PUBLIC) {
      this.checkClaim(context, namespace, 'read')
    }

    let value: ObjectValue = null

    if (version > 0) {
      const objectKey = getObjectKey(this.core.id, baseKey, version)
      const stored = await OBJECTS.get(objectKey, options)
      if ((stored as R2ObjectBody).body) {
        value = await (stored as R2ObjectBody).json()
      }
    }

    return { value, version }
  }

  async putObject(
    params: PutObjectParams,
    context: Context
  ): Promise<PutObjectResult> {
    const { OBJECTS } = this.core.env
    const [namespace, path, value, options] = params
    const { visibility } = options

    this.checkClaim(context, namespace, 'write')

    const baseKey = getBaseKey(namespace, path)
    const indexKey = getIndexKey(baseKey)
    const indexRecord = await this.getIndexRecord(indexKey)

    indexRecord.version++
    if (visibility) {
      const formatVisibility = visibility.toUpperCase()
      if (!Object.keys(VISIBILITY).includes(formatVisibility)) {
        this.error(
          null,
          `invalid visibility: ${visibility}. Must be one of ${Object.keys(
            VISIBILITY
          )}`
        )
      }
      indexRecord.visibility = formatVisibility
    }
    const { version } = indexRecord

    try {
      const { size } = await OBJECTS.put(
        getObjectKey(this.core.id, baseKey, version),
        JSON.stringify(value)
      )
      await this.putIndexRecord(indexKey, indexRecord)
      return { version, size }
    } catch (err) {
      console.error(err)
    }
  }

  async getIndexRecord(indexKey: string): Promise<IndexRecord> {
    const stored: IndexRecord = await this.core.storage.get(indexKey)
    if (stored) {
      return stored
    } else {
      return DEFAULT_INDEX_RECORD
    }
  }

  async putIndexRecord(indexKey: string, record: IndexRecord): Promise<void> {
    await this.core.storage.put(indexKey, record)
  }

  checkClaim(context: Context, namespace: string, operation: string) {
    const path = ['claims', 'capabilities', namespace, operation]
    const claim = _.get(context, path)
    if (claim != true) {
      this.error(null, 'cannot authorize')
    }
  }
}
