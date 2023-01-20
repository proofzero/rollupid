import { Context } from '../context'
import { SCOPES_JSON } from '@kubelt/security/scopes'

export const getScopes = async ({
  input,
  ctx,
}: {
  input: undefined
  ctx: Context
}): Promise<{ scopes: typeof SCOPES_JSON }> => {
  //TODO: this isn't implemented. Here as a placeholder
  return {
    scopes: SCOPES_JSON,
  }
}
