import { z } from 'zod'
import { AccountListSchema } from './jsonrpc/validators/accountList'
import { ProfileSchema } from './jsonrpc/validators/profile'
import { AccountSchema, AccountsSchema } from './jsonrpc/validators/profile'

// TODO: move to types packages
export type AccountList = z.infer<typeof AccountListSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Account = z.infer<typeof AccountSchema>
export type Accounts = z.infer<typeof AccountsSchema>
