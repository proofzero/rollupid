import { Context } from '../context'
import { SCOPES_JSON } from '@kubelt/security/scopes'

export const getScopes = async ({
  input,
  ctx,
}: {
  input: any
  ctx: Context
}): Promise<any> => {
  //TODO: this isn't implemented. Here as a placeholder
  return {
    scopes: SCOPES_JSON,
  }
}
