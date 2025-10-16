import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { db } from '@/lib/db'

async function getPlans(request: NextRequest, user: any) {
  try {
    const plans = await db.investmentPlan.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        amount: 'asc',
      },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investment plans' },
      { status: 500 }
    )
  }
}

async function createPlan(request: NextRequest, user: any) {
  try {
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, amount, dailyROI, duration, description } = body

    if (!name || !amount || !dailyROI || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const plan = await db.investmentPlan.create({
      data: {
        name,
        amount: parseFloat(amount),
        dailyROI: parseFloat(dailyROI),
        duration: parseInt(duration),
        description,
      },
    })

    return NextResponse.json({
      message: 'Investment plan created successfully',
      plan,
    })
  } catch (error) {
    console.error('Create plan error:', error)
    return NextResponse.json(
      { error: 'Failed to create investment plan' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getPlans)
export const POST = withAuth(createPlan)