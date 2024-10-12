import { z } from 'zod'

export const Hex = z.custom<`0x${string}`>(
  (val: unknown) => typeof val === 'string' && val.startsWith('0x')
)

export type Hex = z.infer<typeof Hex>
