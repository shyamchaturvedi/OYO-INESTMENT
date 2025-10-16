import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data with total withdrawn amount
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        kycStatus: true,
        withdrawals: {
          where: { status: 'APPROVED' },
          select: { amount: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate total withdrawn amount
    const totalWithdrawn = user.withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)

    // Get latest KYC document
    const kycData = await db.kYCDocument.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        aadharNumber: true,
        panNumber: true,
        nomineeName: true,
        nomineeRelation: true,
        submittedAt: true,
        reviewedAt: true,
        adminRemark: true
      }
    })

    return NextResponse.json({
      userData: {
        kycStatus: user.kycStatus,
        totalWithdrawn
      },
      kycData
    })

  } catch (error) {
    console.error('KYC status error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch KYC status' 
    }, { status: 500 })
  }
}