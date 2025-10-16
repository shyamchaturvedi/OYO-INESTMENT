import { NextRequest, NextResponse } from 'next/server'
import { db } from './db'
import { logSecurityEvent } from './security'

interface FraudDetectionRule {
  id: string
  name: string
  description: string
  condition: (data: any) => boolean
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  action: 'LOG' | 'ALERT' | 'BLOCK' | 'REQUIRE_VERIFICATION'
}

class FraudDetectionSystem {
  private rules: FraudDetectionRule[] = []
  private suspiciousActivities: Map<string, any[]> = new Map()

  constructor() {
    this.initializeRules()
  }

  private initializeRules() {
    this.rules = [
      {
        id: 'MULTIPLE_RAPID_LOGIN',
        name: 'Multiple Rapid Login Attempts',
        description: 'Multiple login attempts from same IP in short time',
        condition: (data) => {
          const attempts = this.getRecentActivity(data.ip, 'LOGIN', 5 * 60 * 1000) // 5 minutes
          return attempts.length >= 5
        },
        severity: 'HIGH',
        action: 'BLOCK'
      },
      {
        id: 'MULTIPLE_ACCOUNTS_SAME_IP',
        name: 'Multiple Accounts from Same IP',
        description: 'Multiple different accounts accessed from same IP',
        condition: (data) => {
          const accounts = this.getUniqueUsersFromIP(data.ip, 24 * 60 * 60 * 1000) // 24 hours
          return accounts.length >= 3
        },
        severity: 'MEDIUM',
        action: 'ALERT'
      },
      {
        id: 'LARGE_WITHDRAWAL',
        name: 'Large Withdrawal Amount',
        description: 'Withdrawal amount exceeds threshold',
        condition: (data) => {
          return data.amount > 50000 // ₹50,000 threshold
        },
        severity: 'HIGH',
        action: 'REQUIRE_VERIFICATION'
      },
      {
        id: 'RAPID_FINANCIAL_OPERATIONS',
        name: 'Rapid Financial Operations',
        description: 'Multiple financial operations in short time',
        condition: (data) => {
          const operations = this.getRecentActivity(data.userId, 'FINANCIAL', 10 * 60 * 1000) // 10 minutes
          return operations.length >= 3
        },
        severity: 'MEDIUM',
        action: 'ALERT'
      },
      {
        id: 'UNUSUAL_LOGIN_TIME',
        name: 'Unusual Login Time',
        description: 'Login at unusual hours (2 AM - 5 AM)',
        condition: (data) => {
          const hour = new Date(data.timestamp).getHours()
          return hour >= 2 && hour <= 5
        },
        severity: 'LOW',
        action: 'LOG'
      },
      {
        id: 'SUSPICIOUS_USER_AGENT',
        name: 'Suspicious User Agent',
        description: 'Login from known bot or suspicious user agent',
        condition: (data) => {
          const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper', 'automated']
          const userAgent = data.userAgent?.toLowerCase() || ''
          return suspiciousAgents.some(agent => userAgent.includes(agent))
        },
        severity: 'MEDIUM',
        action: 'BLOCK'
      },
      {
        id: 'MULTIPLE_FAILED_ATTEMPTS',
        name: 'Multiple Failed Attempts',
        description: 'Multiple failed login or transaction attempts',
        condition: (data) => {
          const failedAttempts = this.getRecentFailedActivity(data.userId, 'FAILED', 15 * 60 * 1000) // 15 minutes
          return failedAttempts.length >= 3
        },
        severity: 'HIGH',
        action: 'BLOCK'
      },
      {
        id: 'NEW_DEVICE_LOGIN',
        name: 'New Device Login',
        description: 'Login from new device or browser',
        condition: (data) => {
          return this.isNewDevice(data.userId, data.deviceFingerprint)
        },
        severity: 'LOW',
        action: 'REQUIRE_VERIFICATION'
      },
      {
        id: 'UNUSUAL_LOCATION',
        name: 'Unusual Location',
        description: 'Login from unusual geographic location',
        condition: (data) => {
          return this.isUnusualLocation(data.userId, data.location)
        },
        severity: 'MEDIUM',
        action: 'REQUIRE_VERIFICATION'
      },
      {
        id: 'ACCOUNT_TAKEOVER_ATTEMPT',
        name: 'Account Takeover Attempt',
        description: 'Multiple password reset attempts',
        condition: (data) => {
          const resetAttempts = this.getRecentActivity(data.email, 'PASSWORD_RESET', 60 * 60 * 1000) // 1 hour
          return resetAttempts.length >= 2
        },
        severity: 'CRITICAL',
        action: 'BLOCK'
      }
    ]
  }

  async analyzeActivity(activityData: any): Promise<{
    riskScore: number
    violations: FraudDetectionRule[]
    recommendedAction: string
  }> {
    const violations: FraudDetectionRule[] = []
    let riskScore = 0

    // Record the activity
    this.recordActivity(activityData)

    // Check against all rules
    for (const rule of this.rules) {
      try {
        if (rule.condition(activityData)) {
          violations.push(rule)
          
          // Calculate risk score based on severity
          switch (rule.severity) {
            case 'LOW':
              riskScore += 10
              break
            case 'MEDIUM':
              riskScore += 25
              break
            case 'HIGH':
              riskScore += 50
              break
            case 'CRITICAL':
              riskScore += 100
              break
          }

          // Log the violation
          await this.logViolation(rule, activityData)
        }
      } catch (error) {
        console.error(`Error checking fraud rule ${rule.id}:`, error)
      }
    }

    // Determine recommended action
    let recommendedAction = 'ALLOW'
    if (riskScore >= 75) {
      recommendedAction = 'BLOCK'
    } else if (riskScore >= 50) {
      recommendedAction = 'REQUIRE_VERIFICATION'
    } else if (riskScore >= 25) {
      recommendedAction = 'ALERT'
    }

    return {
      riskScore,
      violations,
      recommendedAction
    }
  }

  private recordActivity(data: any) {
    const key = data.userId || data.ip || data.email
    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, [])
    }
    
    const activities = this.suspiciousActivities.get(key)!
    activities.push({
      ...data,
      timestamp: Date.now()
    })

    // Keep only last 24 hours of activities
    const cutoff = Date.now() - (24 * 60 * 60 * 1000)
    this.suspiciousActivities.set(key, activities.filter(a => a.timestamp > cutoff))
  }

  private getRecentActivity(key: string, type: string, timeWindow: number): any[] {
    const activities = this.suspiciousActivities.get(key) || []
    const cutoff = Date.now() - timeWindow
    return activities.filter(a => a.type === type && a.timestamp > cutoff)
  }

  private getRecentFailedActivity(key: string, type: string, timeWindow: number): any[] {
    const activities = this.suspiciousActivities.get(key) || []
    const cutoff = Date.now() - timeWindow
    return activities.filter(a => a.type === type && a.status === 'FAILED' && a.timestamp > cutoff)
  }

  private getUniqueUsersFromIP(ip: string, timeWindow: number): string[] {
    const activities = this.suspiciousActivities.get(ip) || []
    const cutoff = Date.now() - timeWindow
    const recentActivities = activities.filter(a => a.timestamp > cutoff)
    return [...new Set(recentActivities.map(a => a.userId).filter(Boolean))]
  }

  private isNewDevice(userId: string, deviceFingerprint: string): boolean {
    // In production, this would check against a database of known devices
    // For now, return false (no new device detection)
    return false
  }

  private isUnusualLocation(userId: string, location: any): boolean {
    // In production, this would check against known locations for the user
    // For now, return false (no location detection)
    return false
  }

  private async logViolation(rule: FraudDetectionRule, activityData: any) {
    await logSecurityEvent('FRAUD_DETECTION_VIOLATION', {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      action: rule.action,
      activityData
    })

    // Store in database for analysis
    try {
      await db.fraudAlert.create({
        data: {
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          userId: activityData.userId,
          ip: activityData.ip,
          userAgent: activityData.userAgent,
          activityData: JSON.stringify(activityData),
          status: 'OPEN',
          createdAt: new Date()
        }
      })
    } catch (error) {
      console.error('Failed to store fraud alert:', error)
    }
  }

  async getFraudAlerts(filters?: {
    userId?: string
    severity?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    const where: any = {}
    
    if (filters?.userId) where.userId = filters.userId
    if (filters?.severity) where.severity = filters.severity
    if (filters?.status) where.status = filters.status

    return await db.fraudAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true
          }
        }
      }
    })
  }

  async updateFraudAlert(alertId: string, updates: {
    status?: string
    adminRemark?: string
    resolvedAt?: Date
  }) {
    return await db.fraudAlert.update({
      where: { id: alertId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })
  }

  async blockUser(userId: string, reason: string, adminId: string) {
    await db.user.update({
      where: { id: userId },
      data: { 
        status: 'BLOCKED',
        updatedAt: new Date()
      }
    })

    await logSecurityEvent('USER_BLOCKED', {
      userId,
      reason,
      adminId
    })

    // Create fraud alert
    await db.fraudAlert.create({
      data: {
        ruleId: 'MANUAL_BLOCK',
        ruleName: 'Manual User Block',
        severity: 'HIGH',
        userId,
        activityData: JSON.stringify({ reason, adminId }),
        status: 'RESOLVED',
        createdAt: new Date()
      }
    })
  }

  async unblockUser(userId: string, reason: string, adminId: string) {
    await db.user.update({
      where: { id: userId },
      data: { 
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    })

    await logSecurityEvent('USER_UNBLOCKED', {
      userId,
      reason,
      adminId
    })
  }

  getRiskScoreColor(score: number): string {
    if (score >= 75) return 'text-red-600'
    if (score >= 50) return 'text-orange-600'
    if (score >= 25) return 'text-yellow-600'
    return 'text-green-600'
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
}

export const fraudDetection = new FraudDetectionSystem()

// Middleware for fraud detection
export function withFraudDetection(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest, user: any) => {
    const activityData = {
      userId: user.id,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      type: 'API_REQUEST',
      url: request.url,
      method: request.method
    }

    const analysis = await fraudDetection.analyzeActivity(activityData)

    // Take action based on risk score
    if (analysis.recommendedAction === 'BLOCK') {
      return NextResponse.json(
        { error: 'Request blocked due to suspicious activity' },
        { status: 403 }
      )
    }

    if (analysis.recommendedAction === 'REQUIRE_VERIFICATION') {
      return NextResponse.json(
        { 
          error: 'Additional verification required',
          requiresVerification: true,
          violations: analysis.violations
        },
        { status: 403 }
      )
    }

    // Continue with the request but include risk info in headers for monitoring
    const response = await handler(request, user)
    response.headers.set('X-Risk-Score', analysis.riskScore.toString())
    
    return response
  }
}