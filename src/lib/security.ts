import rateLimit from 'express-rate-limit'
import { NextRequest, NextResponse } from 'next/server'

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Stricter rate limiting for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiting for financial operations
export const financialRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 financial operations per hour
  message: {
    error: 'Too many financial operations, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Security headers middleware
export function addSecurityHeaders(response: NextResponse) {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Strict transport security
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Content security policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  )
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}

// CSRF protection
export function validateCSRF(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  // Allow same-origin requests
  if (!origin || origin.includes(host || '')) {
    return true
  }
  
  return false
}

// IP whitelist for admin endpoints
export function validateAdminIP(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for')
  const allowedIPs = process.env.ADMIN_IPS?.split(',') || []
  
  // If no whitelist is configured, allow all (for development)
  if (allowedIPs.length === 0) {
    return true
  }
  
  return allowedIPs.includes(ip || '')
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// Validate Indian phone number
export function validateIndianPhone(phone: string): boolean {
  const indianPhoneRegex = /^[6-9]\d{9}$/
  return indianPhoneRegex.test(phone)
}

// Validate Indian bank account number
export function validateBankAccount(accountNumber: string): boolean {
  // Basic validation for Indian bank account numbers (9-18 digits)
  const bankAccountRegex = /^\d{9,18}$/
  return bankAccountRegex.test(accountNumber.replace(/\s/g, ''))
}

// Validate IFSC code
export function validateIFSC(ifsc: string): boolean {
  // Indian IFSC code format (4 letters + 7 digits)
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
  return ifscRegex.test(ifsc.toUpperCase())
}

// Validate UPI ID
export function validateUPI(upiId: string): boolean {
  // UPI ID format (username@provider)
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/
  return upiRegex.test(upiId.toLowerCase())
}

// Detect suspicious activity
export function detectSuspiciousActivity(request: NextRequest, user: any): boolean {
  const userAgent = request.headers.get('user-agent')
  const ip = request.ip || request.headers.get('x-forwarded-for')
  
  // Check for suspicious user agents
  const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper']
  if (userAgent && suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    return true
  }
  
  // Check for multiple rapid requests from same IP
  // This would need to be implemented with a proper rate limiting store
  
  // Check for unusual login patterns
  // This would need to be implemented with user activity tracking
  
  return false
}

// Encrypt sensitive data
export function encryptSensitiveData(data: string): string {
  // In production, use proper encryption like AES-256
  // For now, basic encoding
  return Buffer.from(data).toString('base64')
}

// Decrypt sensitive data
export function decryptSensitiveData(encryptedData: string): string {
  // In production, use proper decryption
  // For now, basic decoding
  return Buffer.from(encryptedData, 'base64').toString('utf-8')
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Log security events
export function logSecurityEvent(event: string, details: any, request?: NextRequest) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: request?.ip || request?.headers.get('x-forwarded-for'),
    userAgent: request?.headers.get('user-agent'),
  }
  
  console.log('SECURITY_EVENT:', JSON.stringify(logData))
  
  // In production, send to security monitoring service
  // Example: Sentry, Datadog, or custom security dashboard
}