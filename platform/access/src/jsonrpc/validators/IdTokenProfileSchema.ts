import { z } from 'zod'

const IdTokenProfileSchema = z.object({
  name: z.string(),
  picture: z.string(),
})

export default IdTokenProfileSchema
