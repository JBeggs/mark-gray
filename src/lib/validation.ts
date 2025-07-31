import { z } from 'zod'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

// Create DOMPurify instance for server-side use
const window = new JSDOM('').window
const purify = DOMPurify(window as any)

// XSS Protection utility
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link'],
  })
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validation schemas
export const articleSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeText),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .transform(sanitizeText),
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : val),
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters')
    .transform(sanitizeHtml),
  category_id: z.string().uuid('Invalid category ID'),
  featured_image_url: z.string().url('Invalid image URL').optional(),
})

export const businessSchema = z.object({
  name: z.string()
    .min(1, 'Business name is required')
    .max(200, 'Name must be less than 200 characters')
    .transform(sanitizeText),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : val),
  website_url: z.string().url('Invalid website URL').optional(),
  phone: z.string()
    .regex(/^[\d\s\+\-\(\)]+$/, 'Invalid phone number format')
    .max(20, 'Phone number too long')
    .optional()
    .transform(val => val ? sanitizeText(val) : val),
  email: z.string().email('Invalid email address').optional(),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : val),
})

export const adSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .transform(sanitizeText),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : val),
  image_url: z.string().url('Invalid image URL'),
  link_url: z.string().url('Invalid link URL').optional(),
  position: z.enum(['header', 'sidebar', 'content', 'footer']),
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date').optional(),
})

export const profileUpdateSchema = z.object({
  full_name: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeText),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
})

// File upload validation
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_AUDIO_TYPES = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg']

export function validateFileUpload(file: File, allowedTypes: string[]): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not allowed` }
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }
  
  return { valid: true }
}

// Rate limiting helper (simple in-memory store for development)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const record = rateLimitStore.get(identifier)
  
  if (!record || record.resetTime < windowStart) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
} 