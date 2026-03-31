import { z } from 'astro/zod'
import { defineAction } from 'astro:actions'

export const server = {
  signUpForm: defineAction({
    accept: 'form',
    input: z.object({
      'newsletter-email': z.string().email().max(254),
      'newsletter-confirm': z.string().max(254).optional(),
    }),
    handler: async () => {
      // Action is just adding server-side validation, no other logic needed
      return { success: true }
    },
  }),
  contactUsForm: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(2).max(100),
      'contact-email': z.string().email().max(254),
      'contact-confirm': z.string().max(254).optional(),
      subject: z.string().min(3).max(150),
      message: z.string().min(10).max(1000),
    }),
    handler: async () => {
      // Action is just adding server-side validation, no other logic needed
      return { success: true }
    },
  }),
}
