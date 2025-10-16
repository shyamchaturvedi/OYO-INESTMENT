import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { db } from '@/lib/db'
import { ZAI } from 'z-ai-web-dev-sdk'

async function handleCreateInvestment(request: NextRequest, user: any) {
  try {
    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get the investment plan
    const plan = await db.investmentPlan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Investment plan not found' },
        { status: 404 }
      )
    }

    if (plan.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Investment plan is not active' },
        { status: 400 }
      )
    }

    // Check if user has sufficient balance
    if (user.walletBalance < plan.amount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance. Please add funds to your wallet.' },
        { status: 400 }
      )
    }

    // Check if user already has an active investment in this plan
    const existingInvestment = await db.investment.findFirst({
      where: {
        userId: user.id,
        planId: planId,
        status: 'ACTIVE'
      }
    })

    if (existingInvestment) {
      return NextResponse.json(
        { error: 'You already have an active investment in this plan' },
        { status: 400 }
      )
    }

    // Calculate end date
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.duration)

    // Create the investment
    const investment = await db.investment.create({
      data: {
        userId: user.id,
        planId: planId,
        amount: plan.amount,
        dailyROI: plan.dailyROI,
        totalDays: plan.duration,
        remainingDays: plan.duration,
        startDate: startDate,
        endDate: endDate,
      },
      include: {
        plan: true
      }
    })

    // Deduct amount from user's wallet
    await db.user.update({
      where: { id: user.id },
      data: {
        walletBalance: {
          decrement: plan.amount
        }
      }
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'INVESTMENT',
        amount: plan.amount,
        description: `Investment in ${plan.name}`,
        status: 'COMPLETED',
        referenceId: investment.id,
        metadata: JSON.stringify({
          planId: planId,
          planName: plan.name,
          dailyROI: plan.dailyROI,
          duration: plan.duration
        })
      }
    })

    // Process referral commissions if user was referred
    if (user.referredBy) {
      await processReferralCommissions(user.id, user.referredBy, plan.amount, investment.id)
    }

    // Get updated user data
    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        referralCode: true,
        walletBalance: true,
        totalEarnings: true,
        kycStatus: true,
        role: true,
        status: true
      }
    })

    return NextResponse.json({
      message: 'Investment created successfully',
      investment: {
        id: investment.id,
        planName: investment.plan.name,
        amount: investment.amount,
        dailyROI: investment.dailyROI,
        remainingDays: investment.remainingDays,
        totalEarned: investment.totalEarned,
        status: investment.status,
        startDate: investment.startDate,
        endDate: investment.endDate
      },
      user: updatedUser
    })

  } catch (error) {
    console.error('Investment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    )
  }
}

async function processReferralCommissions(userId: string, referralCode: string, amount: number, investmentId: string) {
  try {
    // Get commission settings
    const commissionSettings = await db.commissionSettings.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' }
    })

    // Find the referrer
    let currentReferrer = await db.user.findUnique({
      where: { referralCode }
    })

    if (!currentReferrer) {
      return
    }

    // Process commissions for each level
    for (let level = 0; level < commissionSettings.length && currentReferrer; level++) {
      const commission = commissionSettings[level]
      if (!commission) continue

      const commissionAmount = (amount * commission.percentage) / 100

      // Create commission record
      await db.referralCommission.create({
        data: {
          userId: currentReferrer.id,
          fromUserId: userId,
          investmentId: investmentId,
          level: level + 1,
          percentage: commission.percentage,
          amount: commissionAmount
        }
      })

      // Update referrer's wallet and earnings
      await db.user.update({
        where: { id: currentReferrer.id },
        data: {
          walletBalance: {
            increment: commissionAmount
          },
          totalEarnings: {
            increment: commissionAmount
          }
        }
      })

      // Create transaction record for referrer
      await db.transaction.create({
        data: {
          userId: currentReferrer.id,
          type: 'REFERRAL',
          amount: commissionAmount,
          description: `Level ${level + 1} referral commission`,
          status: 'COMPLETED',
          referenceId: investmentId,
          metadata: JSON.stringify({
            fromUserId: userId,
            level: level + 1,
            percentage: commission.percentage
          })
        }
      })

      // Move to next level referrer
      if (currentReferrer.referredBy) {
        currentReferrer = await db.user.findUnique({
          where: { referralCode: currentReferrer.referredBy }
        })
      } else {
        break
      }
    }

  } catch (error) {
    console.error('Referral commission processing error:', error)
  }
}

export const POST = withAuth(handleCreateInvestment)