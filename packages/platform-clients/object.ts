import type {
  GetObjectResult,
  ObjectValue,
  PutObjectOptions,
  PutObjectResult,
} from '@kubelt/platform.object/src/types'

import type { BaseApi } from './base'
import createClient from './fetcher'

export interface ObjectApi extends BaseApi {
  kb_getObject(namespace: string, path: string): Promise<GetObjectResult>
  kb_putObject(
    namespace: string,
    path: string,
    value: ObjectValue,
    options: PutObjectOptions
  ): Promise<PutObjectResult>
}

export default (
  fetcher: Fetcher,
  requestInit?: RequestInit<RequestInitCfProperties> | undefined
) => createClient<ObjectApi>(fetcher, requestInit)
