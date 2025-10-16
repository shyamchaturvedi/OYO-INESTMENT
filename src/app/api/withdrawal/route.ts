import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'
import { checkKYCForWithdrawal } from '@/lib/kyc-check'

const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal amount is ₹100'),
  method: z.enum(['UPI', 'BANK_TRANSFER']),
  details: z.string().min(1, 'Payment details are required'),
})

async function handleWithdrawal(request: NextRequest, user: any) {
  try {
    const body = await request.json()
    const validatedData = withdrawalSchema.parse(body)

    // Check if user has sufficient balance
    if (user.walletBalance < validatedData.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Perform KYC check based on RBI rules
    const kycCheck = await checkKYCForWithdrawal(user.id, validatedData.amount)
    
    if (!kycCheck.canWithdraw) {
      return NextResponse.json(
        { 
          error: 'KYC verification required',
          message: kycCheck.message,
          requiresKYC: true,
          currentTotal: kycCheck.currentTotal,
          limit: kycCheck.limit
        },
        { status: 400 }
      )
    }

    // Check for existing pending withdrawals
    const existingPendingWithdrawal = await db.withdrawal.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    })

    if (existingPendingWithdrawal) {
      return NextResponse.json(
        { error: 'You already have a pending withdrawal request' },
        { status: 400 }
      )
    }

    // Create withdrawal record with PENDING status
    const withdrawal = await db.withdrawal.create({
      data: {
        userId: user.id,
        amount: validatedData.amount,
        method: validatedData.method,
        details: validatedData.details,
        status: 'PENDING',
      },
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'WITHDRAWAL',
        amount: validatedData.amount,
        description: `Withdrawal request - ${validatedData.method}`,
        status: 'PENDING',
        referenceId: withdrawal.id,
        metadata: JSON.stringify({
          method: validatedData.method,
          details: validatedData.details,
          kycCheck: kycCheck
        }),
      },
    })

    // Create notification for user about withdrawal limits
    if (kycCheck.requiresKYC) {
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Withdrawal Limit Warning',
          message: `You have withdrawn ₹${kycCheck.currentTotal} of your ₹${kycCheck.limit} limit. Complete KYC to continue unlimited withdrawals.`,
          type: 'WITHDRAWAL'
        }
      })
    }

    // NOTE: Don't deduct from wallet balance until admin approves
    // The balance will be deducted when admin approves the withdrawal

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        method: withdrawal.method,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
      },
      kycInfo: {
        currentTotal: kycCheck.currentTotal,
        limit: kycCheck.limit,
        remaining: kycCheck.limit - kycCheck.currentTotal,
        requiresKYC: kycCheck.requiresKYC
      }
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process withdrawal request' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handleWithdrawal)

// Get user's withdrawal history
async function getWithdrawalHistory(request: NextRequest, user: any) {
  try {
    const withdrawals = await db.withdrawal.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        adminRemark: true,
        processedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error('Get withdrawal history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch withdrawal history' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getWithdrawalHistory)