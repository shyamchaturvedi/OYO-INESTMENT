import { db } from '@/lib/db'
import { KYCStatus } from '@prisma/client'

export interface KYCCheckResult {
  canWithdraw: boolean
  requiresKYC: boolean
  currentTotal: number
  limit: number
  message?: string
}

export async function checkKYCForWithdrawal(userId: string, amount: number): Promise<KYCCheckResult> {
  try {
    // Get user's current KYC status
    const user = await db.user.findUnique({
      where: { id },
      select: { kycStatus: true }
    })

    if (!user) {
      return {
        canWithdraw: false,
        requiresKYC: false,
        currentTotal: 0,
        limit: 500,
        message: 'User not found'
      }
    }

    // If KYC is already approved, allow withdrawal
    if (user.kycStatus === 'APPROVED') {
      return {
        canWithdraw: true,
        requiresKYC: false,
        currentTotal: 0,
        limit: 500
      }
    }

    // Calculate total withdrawn amount
    const totalWithdrawn = await db.withdrawal.aggregate({
      where: {
        userId,
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    })

    const currentTotal = totalWithdrawn._sum.amount || 0
    const newTotal = currentTotal + amount
    const limit = 500

    // Check if new total exceeds the limit
    if (newTotal > limit) {
      return {
        canWithdraw: false,
        requiresKYC: true,
        currentTotal,
        limit,
        message: `As per RBI guidelines, KYC is mandatory for cumulative withdrawals exceeding ₹${limit}. Your current total is ₹${currentTotal} and this withdrawal would make it ₹${newTotal}. Please complete your KYC verification.`
      }
    }

    // Allow withdrawal if under the limit
    return {
      canWithdraw: true,
      requiresKYC: false,
      currentTotal,
      limit,
      message: `You can withdraw ₹${limit - currentTotal} more before KYC is required.`
    }

  } catch (error) {
    console.error('KYC check error:', error)
    return {
      canWithdraw: false,
      requiresKYC: false,
      currentTotal: 0,
      limit: 500,
      message: 'Failed to verify KYC status'
    }
  }
}

export async function getUserKYCStatus(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { kycStatus: true }
    })

    if (!user) {
      return { status: 'NOT_FOUND', message: 'User not found' }
    }

    // Get total withdrawn amount
    const totalWithdrawn = await db.withdrawal.aggregate({
      where: {
        userId,
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    })

    const currentTotal = totalWithdrawn._sum.amount || 0
    const limit = 500
    const remainingLimit = Math.max(0, limit - currentTotal)

    return {
      status: user.kycStatus,
      currentTotal,
      limit,
      remainingLimit,
      needsKYC: currentTotal >= limit || user.kycStatus !== 'APPROVED',
      message: user.kycStatus === 'APPROVED' 
        ? 'KYC verified - No withdrawal limits'
        : currentTotal >= limit
        ? `KYC required - You've reached the ₹${limit} withdrawal limit`
        : `You can withdraw ₹${remainingLimit.toFixed(2)} more before KYC is required`
    }

  } catch (error) {
    console.error('Get KYC status error:', error)
    return { 
      status: 'ERROR', 
      message: 'Failed to get KYC status' 
    }
  }
}

// Middleware function to check KYC before withdrawal
export function withKYCCheck(handler: (req: any, user: any) => Promise<Response>) {
  return async (req: any, user: any) => {
    try {
      const body = await req.json()
      const { amount } = body

      if (!amount || amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid withdrawal amount' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const kycCheck = await checkKYCForWithdrawal(user.id, amount)

      if (!kycCheck.canWithdraw) {
        return new Response(
          JSON.stringify({
            error: 'KYC verification required',
            message: kycCheck.message,
            requiresKYC: kycCheck.requiresKYC,
            currentTotal: kycCheck.currentTotal,
            limit: kycCheck.limit
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // If KYC check passes, proceed with the original handler
      return handler(req, user)

    } catch (error) {
      console.error('KYC middleware error:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}