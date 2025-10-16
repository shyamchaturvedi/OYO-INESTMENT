import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/middleware'
import { db } from '@/lib/db'
import { z } from 'zod'
import { validateIndianPhone, validateBankAccount, validateIFSC, validateUPI } from '@/lib/security'
import { logSecurityEvent } from '@/lib/security'

const kycSchema = z.object({
  aadharFront: z.string().optional(),
  aadharBack: z.string().optional(),
  panCard: z.string().min(1, 'PAN card is required'),
  bankDetails: z.object({
    accountNumber: z.string().min(1, 'Account number is required'),
    ifsc: z.string().min(1, 'IFSC code is required'),
    accountHolderName: z.string().min(1, 'Account holder name is required'),
    bankName: z.string().min(1, 'Bank name is required'),
  }).optional(),
  upiId: z.string().optional(),
})

async function handleKYCSubmission(request: NextRequest, user: any) {
  try {
    const body = await request.json()
    const validatedData = kycSchema.parse(body)

    // Check if KYC already submitted
    const existingKYC = await db.kYCDocument.findFirst({
      where: { userId: user.id }
    })

    if (existingKYC && existingKYC.status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'KYC already submitted and is under review or approved' },
        { status: 400 }
      )
    }

    // Validate bank details if provided
    if (validatedData.bankDetails) {
      if (!validateBankAccount(validatedData.bankDetails.accountNumber)) {
        return NextResponse.json(
          { error: 'Invalid bank account number' },
          { status: 400 }
        )
      }

      if (!validateIFSC(validatedData.bankDetails.ifsc)) {
        return NextResponse.json(
          { error: 'Invalid IFSC code' },
          { status: 400 }
        )
      }
    }

    // Validate UPI ID if provided
    if (validatedData.upiId && !validateUPI(validatedData.upiId)) {
      return NextResponse.json(
        { error: 'Invalid UPI ID' },
        { status: 400 }
      )
    }

    // Validate PAN card format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(validatedData.panCard.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid PAN card format' },
        { status: 400 }
      )
    }

    // Encrypt sensitive data
    const encryptedBankDetails = validatedData.bankDetails 
      ? JSON.stringify(validatedData.bankDetails)
      : null

    // Check if KYC already exists
    const existingKYC = await db.kYCDocument.findFirst({
      where: { userId: user.id }
    })

    let kycDocument
    if (existingKYC) {
      // Update existing KYC
      kycDocument = await db.kYCDocument.update({
        where: { id: existingKYC.id },
        data: {
          aadharFront: validatedData.aadharFront,
          aadharBack: validatedData.aadharBack,
          panCard: validatedData.panCard,
          bankDetails: encryptedBankDetails,
          upiId: validatedData.upiId,
          status: 'PENDING',
          submittedAt: new Date(),
          reviewedAt: null,
          adminRemark: null,
        },
      })
    } else {
      // Create new KYC
      kycDocument = await db.kYCDocument.create({
        data: {
          userId: user.id,
          aadharFront: validatedData.aadharFront,
          aadharBack: validatedData.aadharBack,
          panCard: validatedData.panCard,
          bankDetails: encryptedBankDetails,
          upiId: validatedData.upiId,
          status: 'PENDING',
          submittedAt: new Date(),
        },
      })
    }

    // Update user KYC status
    await db.user.update({
      where: { id: user.id },
      data: { kycStatus: 'PENDING' }
    })

    // Log KYC submission
    await logSecurityEvent('KYC_SUBMITTED', {
      userId: user.id,
      kycId: kycDocument.id
    }, request)

    return NextResponse.json({
      message: 'KYC documents submitted successfully',
      kycDocument: {
        id: kycDocument.id,
        status: kycDocument.status,
        submittedAt: kycDocument.submittedAt,
      }
    })
  } catch (error) {
    console.error('KYC submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit KYC documents' },
      { status: 500 }
    )
  }
}

// Get KYC status
async function getKYCStatus(request: NextRequest, user: any) {
  try {
    const kycDocument = await db.kYCDocument.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        adminRemark: true,
      }
    })

    return NextResponse.json({
      kycStatus: user.kycStatus,
      kycDocument
    })
  } catch (error) {
    console.error('Get KYC status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KYC status' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(handleKYCSubmission)
export const GET = withAuth(getKYCStatus)