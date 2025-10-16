import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { KYCStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, adminRemark } = await request.json()

    if (!status || !adminRemark?.trim()) {
      return NextResponse.json({ 
        error: 'Status and admin remarks are required' 
      }, { status: 400 })
    }

    if (!Object.values(KYCStatus).includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status' 
      }, { status: 400 })
    }

    // Get the KYC application
    const kycApplication = await db.kYCDocument.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!kycApplication) {
      return NextResponse.json({ 
        error: 'KYC application not found' 
      }, { status: 404 })
    }

    if (kycApplication.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Application has already been reviewed' 
      }, { status: 400 })
    }

    // Update KYC application
    const updatedApplication = await db.kYCDocument.update({
      where: { id: params.id },
      data: {
        status,
        adminRemark,
        reviewedAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Update user KYC status
    await db.user.update({
      where: { id: kycApplication.userId },
      data: { kycStatus: status }
    })

    // Create notification for user
    await db.notification.create({
      data: {
        userId: kycApplication.userId,
        title: `KYC ${status}`,
        message: `Your KYC application has been ${status.toLowerCase()}. ${adminRemark}`,
        type: 'KYC'
      }
    })

    // If approved, create a transaction record
    if (status === 'APPROVED') {
      await db.transaction.create({
        data: {
          userId: kycApplication.userId,
          type: 'KYC',
          amount: 0,
          description: 'KYC verification approved',
          status: 'COMPLETED',
          referenceId: kycApplication.id,
          metadata: JSON.stringify({
            kycId: kycApplication.id,
            approvedBy: session.user.id,
            approvedAt: new Date().toISOString()
          })
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `KYC application ${status.toLowerCase()} successfully`,
      application: updatedApplication
    })

  } catch (error) {
    console.error('KYC review error:', error)
    return NextResponse.json({ 
      error: 'Failed to review KYC application' 
    }, { status: 500 })
  }
}