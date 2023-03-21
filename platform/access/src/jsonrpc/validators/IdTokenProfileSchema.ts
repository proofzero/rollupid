import { z } from 'zod'

const IdTokenProfileSchema = z.object({
  name: z.string().optional(),
  picture: z.string().optional(),
})

export default IdTokenProfileSchema
