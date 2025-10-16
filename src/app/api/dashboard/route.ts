import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { db } from '@/lib/db'

async function handleDashboard(request: NextRequest, user: any) {
  try {
    // Get user's active investments
    const activeInvestments = await db.investment.count({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
    })

    // Get today's ROI
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayROI = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: 'ROI',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    })

    const todayROIAmount = todayROI._sum.amount || 0

    // Get total referrals (direct)
    const totalReferrals = await db.user.count({
      where: {
        referredBy: user.referralCode,
      },
    })

    // Get level income (referral commissions)
    const levelIncomeRecords = await db.referralCommission.findMany({
      where: {
        userId: user.id,
      },
      select: {
        amount: true,
      },
    })

    const levelIncome = levelIncomeRecords.reduce((sum, record) => sum + record.amount, 0)

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        createdAt: true,
        status: true,
      },
    })

    // Get active investments with details
    const investments = await db.investment.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        plan: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedInvestments = investments.map(inv => ({
      id: inv.id,
      planName: inv.plan.name,
      amount: inv.amount,
      dailyROI: inv.dailyROI,
      remainingDays: inv.remainingDays,
      totalEarned: inv.totalEarned,
      status: inv.status,
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        kycStatus: user.kycStatus,
        role: user.role,
      },
      stats: {
        activeInvestments,
        todayROI: todayROIAmount,
        totalReferrals,
        levelIncome: levelIncome,
      },
      recentTransactions,
      investments: formattedInvestments,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: user?.id || 'unknown'
    })
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    )
  }
}

export const GET = withAuth(handleDashboard)