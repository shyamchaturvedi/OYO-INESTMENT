import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'

const adminActionSchema = z.object({
  withdrawalId: z.string(),
  action: z.enum(['APPROVE', 'REJECT']),
  adminRemark: z.string().optional(),
})

async function handleAdminWithdrawalAction(request: NextRequest, user: any) {
  try {
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = adminActionSchema.parse(body)

    // Get the withdrawal request
    const withdrawal = await db.withdrawal.findUnique({
      where: { id: validatedData.withdrawalId },
      include: { user: true },
    })

    if (!withdrawal) {
      return NextResponse.json(
        { error: 'Withdrawal request not found' },
        { status: 404 }
      )
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Withdrawal already processed' },
        { status: 400 }
      )
    }

    const updateData: any = {
      status: validatedData.action,
      adminRemark: validatedData.adminRemark || null,
      processedAt: new Date(),
    }

    // If approving, deduct from user's wallet
    if (validatedData.action === 'APPROVE') {
      // Check if user still has sufficient balance
      if (withdrawal.user.walletBalance < withdrawal.amount) {
        return NextResponse.json(
          { error: 'User has insufficient balance for this withdrawal' },
          { status: 400 }
        )
      }

      // Update user's wallet balance
      await db.user.update({
        where: { id: withdrawal.userId },
        data: {
          walletBalance: {
            decrement: withdrawal.amount,
          },
        },
      })

      // Update transaction status to COMPLETED
      await db.transaction.updateMany({
        where: {
          userId: withdrawal.userId,
          referenceId: withdrawal.id,
          type: 'WITHDRAWAL',
        },
        data: {
          status: 'COMPLETED',
        },
      })

      // Create a new transaction for the completed withdrawal
      await db.transaction.create({
        data: {
          userId: withdrawal.userId,
          type: 'WITHDRAWAL',
          amount: withdrawal.amount,
          description: `Withdrawal processed - ${withdrawal.method}`,
          status: 'COMPLETED',
          referenceId: withdrawal.id,
          metadata: JSON.stringify({
            method: withdrawal.method,
            details: withdrawal.details,
            processedBy: user.id,
          }),
        },
      })
    } else {
      // If rejecting, update transaction status to FAILED
      await db.transaction.updateMany({
        where: {
          userId: withdrawal.userId,
          referenceId: withdrawal.id,
          type: 'WITHDRAWAL',
        },
        data: {
          status: 'FAILED',
        },
      })

      // Create a new transaction for the rejected withdrawal
      await db.transaction.create({
        data: {
          userId: withdrawal.userId,
          type: 'WITHDRAWAL',
          amount: withdrawal.amount,
          description: `Withdrawal rejected - ${validatedData.adminRemark || 'Admin rejected'}`,
          status: 'FAILED',
          referenceId: withdrawal.id,
          metadata: JSON.stringify({
            method: withdrawal.method,
            details: withdrawal.details,
            rejectedBy: user.id,
            reason: validatedData.adminRemark,
          }),
        },
      })
    }

    // Update withdrawal status
    const updatedWithdrawal = await db.withdrawal.update({
      where: { id: validatedData.withdrawalId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: `Withdrawal ${validatedData.action.toLowerCase()}d successfully`,
      withdrawal: updatedWithdrawal,
    })
  } catch (error) {
    console.error('Admin withdrawal action error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process withdrawal action' },
      { status: 500 }
    )
  }
}

// Get all pending withdrawals for admin
async function getPendingWithdrawals(request: NextRequest, user: any) {
  try {
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const withdrawals = await db.withdrawal.findMany({
      where: { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            kycStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const total = await db.withdrawal.count({
      where: { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
    })

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get pending withdrawals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending withdrawals' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handleAdminWithdrawalAction)
export const GET = withAuth(getPendingWithdrawals)