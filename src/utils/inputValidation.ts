
import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(254, 'Email too long')
  .refine(email => !email.includes('<') && !email.includes('>'), 'Invalid characters in email');

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation schema
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters')
  .refine(name => name.trim().length > 0, 'Name cannot be empty');

// General text input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

// Phone number validation
export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();

// URL validation
export const urlSchema = z.string()
  .url('Invalid URL format')
  .refine(url => url.startsWith('https://') || url.startsWith('http://'), 'URL must include protocol')
  .optional();

// Authentication form validation
export const authFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema.optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long')
    .refine(msg => !msg.includes('<script'), 'Invalid content in message'),
});

// Quote request validation
export const quoteRequestSchema = z.object({
  customerName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  productName: z.string().min(1, 'Product name is required').max(200),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(10000),
  message: z.string().max(1000, 'Message too long').optional(),
});
