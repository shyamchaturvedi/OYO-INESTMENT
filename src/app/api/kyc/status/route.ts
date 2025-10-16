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
        panNumber: true,
        bankDetails: true,
        upiId: true,
        aadharFront: true,
        aadharBack: true,
        submittedAt: true,
        reviewedAt: true,
        adminRemark: true
      }
    })

    // Format KYC data for live components
    const kyc = kycData ? {
      id: kycData.id,
      status: kycData.status,
      submittedAt: kycData.submittedAt.toISOString(),
      reviewedAt: kycData.reviewedAt?.toISOString(),
      adminRemark: kycData.adminRemark,
      documents: {
        aadharFront: !!kycData.aadharFront,
        aadharBack: !!kycData.aadharBack,
        panCard: !!kycData.panNumber,
        bankDetails: !!kycData.bankDetails
      }
    } : null

    return NextResponse.json({
      success: true,
      userData: {
        kycStatus: user.kycStatus,
        totalWithdrawn
      },
      kyc
    })

  } catch (error) {
    console.error('KYC status error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch KYC status' 
    }, { status: 500 })
  }
}