import { z } from 'zod'

const signUpFormSchema = z.object({
  'newsletter-email': z.email().trim().max(254),
  'newsletter-confirm': z.string().max(254).optional(),
})

export default signUpFormSchema
