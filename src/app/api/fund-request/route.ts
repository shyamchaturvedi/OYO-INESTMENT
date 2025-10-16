import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { db } from '@/lib/db'

async function handleCreateFundRequest(request: NextRequest, user: any) {
  try {
    const { amount, method, transactionId, screenshot } = await request.json()

    if (!amount || !method) {
      return NextResponse.json(
        { error: 'Amount and payment method are required' },
        { status: 400 }
      )
    }

    if (amount < 50) {
      return NextResponse.json(
        { error: 'Minimum add amount is ₹50' },
        { status: 400 }
      )
    }

    // Create fund request
    const fundRequest = await db.fundRequest.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        method: method,
        transactionId: transactionId || null,
        screenshot: screenshot || null,
        status: 'PENDING'
      }
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        userId: user.id,
        type: 'ADD_FUNDS',
        amount: parseFloat(amount),
        description: `Add funds request - ${method}`,
        status: 'PENDING',
        referenceId: fundRequest.id,
        metadata: JSON.stringify({
          method: method,
          transactionId: transactionId,
          fundRequestId: fundRequest.id
        })
      }
    })

    return NextResponse.json({
      message: 'Fund request submitted successfully',
      fundRequest: {
        id: fundRequest.id,
        amount: fundRequest.amount,
        method: fundRequest.method,
        status: fundRequest.status,
        createdAt: fundRequest.createdAt
      }
    })

  } catch (error) {
    console.error('Fund request creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create fund request' },
      { status: 500 }
    )
  }
}

async function handleGetFundRequests(request: NextRequest, user: any) {
  try {
    const fundRequests = await db.fundRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        method: true,
        transactionId: true,
        status: true,
        adminRemark: true,
        processedAt: true,
        createdAt: true
      }
    })

    return NextResponse.json({ fundRequests })

  } catch (error) {
    console.error('Fund requests fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fund requests' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handleCreateFundRequest)
export const GET = withAuth(handleGetFundRequests)