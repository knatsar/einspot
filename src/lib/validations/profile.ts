import * as z from 'zod'

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .nullable()
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').nullable().optional(),
  company: z.string().max(100, 'Company name must be less than 100 characters').nullable().optional(),
  website: z.string().url('Invalid URL').nullable().optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required')
  }).nullable().optional(),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    marketing_emails: z.boolean().default(false),
    sms_notifications: z.boolean().default(false),
    language: z.string().default('en'),
    theme: z.enum(['light', 'dark', 'system']).default('system')
  }).default({
    newsletter: false,
    marketing_emails: false,
    sms_notifications: false,
    language: 'en',
    theme: 'system'
  })
})

export type ProfileFormData = z.infer<typeof profileSchema>
