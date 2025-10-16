import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { 
  addSecurityHeaders, 
  validateCSRF, 
  detectSuspiciousActivity, 
  logSecurityEvent,
  validateAdminIP,
  sanitizeInput
} from './security'

export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      // Add security headers
      const response = NextResponse.next()
      addSecurityHeaders(response)

      // Validate CSRF for non-GET requests
      if (request.method !== 'GET') {
        if (!validateCSRF(request)) {
          logSecurityEvent('CSRF_VALIDATION_FAILED', { 
            method: request.method,
            url: request.url 
          }, request)
          return NextResponse.json(
            { error: 'Invalid request origin' },
            { status: 403 }
          )
        }
      }

      // Sanitize input data
      if (request.method === 'POST' || request.method === 'PUT') {
        const body = await request.clone().text()
        try {
          const parsedBody = JSON.parse(body)
          // Sanitize string fields
          Object.keys(parsedBody).forEach(key => {
            if (typeof parsedBody[key] === 'string') {
              parsedBody[key] = sanitizeInput(parsedBody[key])
            }
          })
        } catch (e) {
          // Invalid JSON, continue
        }
      }

      const token = request.cookies.get('token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '')

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      const payload = verifyToken(token)
      if (!payload) {
        logSecurityEvent('INVALID_TOKEN', { 
          token: token.substring(0, 10) + '...' 
        }, request)
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }

      // Get user from database
      const { db } = await import('./db')
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          referralCode: true,
          role: true,
          status: true,
          walletBalance: true,
          totalEarnings: true,
          kycStatus: true,
          lastLoginAt: true,
          createdAt: true,
        },
      })

      if (!user || user.status === 'BLOCKED') {
        logSecurityEvent('BLOCKED_USER_ACCESS', { 
          userId: user?.id || 'unknown',
          status: user?.status || 'not_found'
        }, request)
        return NextResponse.json(
          { error: 'User not found or blocked' },
          { status: 403 }
        )
      }

      // Detect suspicious activity
      if (detectSuspiciousActivity(request, user)) {
        logSecurityEvent('SUSPICIOUS_ACTIVITY', { 
          userId: user.id,
          userAgent: request.headers.get('user-agent'),
          ip: request.ip
        }, request)
        
        // In production, you might want to block the request or require additional verification
        // For now, we'll log it but allow the request
      }

      // Update last login time
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })

      return handler(request, user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      logSecurityEvent('AUTH_MIDDLEWARE_ERROR', { 
        error: error.message 
      }, request)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
  }
}

export function withAdminAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, user: any) => {
    // Validate admin IP
    if (!validateAdminIP(request)) {
      logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', { 
        userId: user.id,
        ip: request.ip
      }, request)
      return NextResponse.json(
        { error: 'Unauthorized admin access' },
        { status: 403 }
      )
    }

    if (user.role !== 'ADMIN') {
      logSecurityEvent('NON_ADMIN_ACCESS_ATTEMPT', { 
        userId: user.id,
        role: user.role
      }, request)
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return handler(request, user)
  })
}

// Rate limiting middleware
export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  const requests = new Map<string, { count: number; resetTime: number }>()
  
  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (now > value.resetTime) {
        requests.delete(key)
      }
    }
    
    // Check current IP
    const current = requests.get(ip)
    if (current) {
      if (current.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests, please try again later' },
          { status: 429 }
        )
      }
      current.count++
    } else {
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      })
    }
    
    return handler(request)
  }
}

// Financial operations middleware
export function withFinancialAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, user: any) => {
    // Additional checks for financial operations
    
    // Check if user is verified
    if (user.kycStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'KYC verification required for financial operations' },
        { status: 403 }
      )
    }
    
    // Check if user has any suspicious activity
    // This would involve checking a separate suspicious activity table
    
    // Log financial operation
    logSecurityEvent('FINANCIAL_OPERATION', { 
      userId: user.id,
      operation: request.url,
      method: request.method
    }, request)
    
    return handler(request, user)
  })
}