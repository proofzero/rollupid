import { DurableObject } from '@kubelt/platform.commons'

import { DEFAULT_INDEX_RECORD, VISIBILITY } from './constants'

import {
  Api,
  Environment,
  GetObjectOptions,
  GetObjectResult,
  IndexRecord,
  ObjectValue,
  PutObjectOptions,
  PutObjectResult,
} from './types'

import {
  getBaseKey,
  getIndexKey,
  getObjectBaseKey,
  getObjectKey,
  getObjectVersionFromKey,
} from './utils'

export default class Core extends DurableObject<Environment, Api> {
  methods(): Api {
    return {
      kb_getObject: this.getObject.bind(this),
      kb_putObject: this.putObject.bind(this),
    }
  }

  async getObject(
    namespace: string,
    path: string,
    options: GetObjectOptions
  ): Promise<GetObjectResult> {
    const { Objects } = this.env
    const baseKey = getBaseKey(namespace, path)
    const indexKey = getIndexKey(baseKey)
    const indexRecord = await this.getIndexRecord(indexKey)

    if (indexRecord.version == 0) {
      const found = await this.findVersion(baseKey)
      indexRecord.version = found
    }

    const { version } = indexRecord

    let value: ObjectValue = null

    if (version > 0) {
      const objectKey = getObjectKey(this.id, baseKey, version)
      const stored = await Objects.get(objectKey, options)
      if (!stored) {
        await this.deleteIndexRecord(indexKey)
        return { value, version }
      }
      if ((stored as R2ObjectBody).body) {
        value = await (stored as R2ObjectBody).json()
      }
    }

    return { value, version }
  }

  async putObject(
    namespace: string,
    path: string,
    value: ObjectValue,
    options: PutObjectOptions
  ): Promise<PutObjectResult> {
    const { Objects } = this.env
    const { visibility } = options
    const baseKey = getBaseKey(namespace, path)
    const indexKey = getIndexKey(baseKey)
    const indexRecord = await this.getIndexRecord(indexKey)

    if (indexRecord.version == 0) {
      indexRecord.version = await this.findVersion(baseKey)
    }
    indexRecord.version++

    if (visibility) {
      indexRecord.visibility = visibility.toUpperCase()
      if (VISIBILITY[indexRecord.visibility] == null) {
        throw 'invalid option: visibility'
      }
    }

    const { version } = indexRecord

    try {
      const { size } = await Objects.put(
        getObjectKey(this.id, baseKey, version),
        JSON.stringify(value)
      )
      await this.putIndexRecord(indexKey, indexRecord)
      return { version, size }
    } catch (err) {
      console.error(err)
      throw 'put object failed'
    }
  }

  async getIndexRecord(indexKey: string): Promise<IndexRecord> {
    const stored = await this.storage.get<IndexRecord>(indexKey)
    if (stored) {
      return stored
    } else {
      return DEFAULT_INDEX_RECORD
    }
  }

  async putIndexRecord(indexKey: string, record: IndexRecord): Promise<void> {
    await this.storage.put(indexKey, record)
  }

  async deleteIndexRecord(indexKey: string): Promise<void> {
    await this.storage.delete(indexKey)
  }

  async findVersion(key: string): Promise<number> {
    const { Objects } = this.env
    let cursor = undefined
    const prefix = getObjectBaseKey(this.id, key)
    const limit = 1
    let keys: number[] = []
    do {
      const result: R2Objects = await Objects.list({
        cursor,
        prefix,
        limit,
      })
      cursor = result.cursor
      keys = keys.concat(
        result.objects.map(({ key }) => getObjectVersionFromKey(key))
      )
    } while (cursor)

    const latest = keys.sort((a, b) => a - b).pop()
    return latest || 0
  }
}
