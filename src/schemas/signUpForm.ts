import { z } from 'zod'

const signupFormSchema = z.object({
  'signup-email': z.email().trim().max(254),
  'signup-confirm': z.string().max(254).optional(),
})

export default signupFormSchema
