import { z } from 'astro/zod'
import { defineAction } from 'astro:actions'

export const server = {
  signUpForm: defineAction({
    accept: 'form',
    input: z.object({
      'newsletter-email': z.string().trim().email().max(254),
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
      name: z
        .string()
        .trim()
        .min(2, { message: 'Name must be longer than 2 characters' })
        .max(100, { message: 'Name cannot exceed 100 characters' })
        .regex(/^[a-zA-Z\s'-]+$/, {
          message:
            'Name should only contain letters, spaces, hyphens, and apostrophes',
        }),
      'contact-email': z.string().trim().email().max(254),
      'contact-confirm': z.string().max(254).optional(),
      subject: z
        .string()
        .trim()
        .min(3, { message: 'Subject must be longer than 3 characters' })
        .max(150, { message: 'Subject cannot exceed 150 characters' })
        .regex(/^[^<>{}()]*$/, {
          message: 'Subject can only contain valid characters',
        }),
      message: z
        .string()
        .trim()
        .min(10)
        .max(1000)
        .regex(/^[^<>{}()]*$/, {
          message: 'Message can only contain valid characters',
        }),
    }),
    handler: async () => {
      // Action is just adding server-side validation, no other logic needed
      return { success: true }
    },
  }),
}
