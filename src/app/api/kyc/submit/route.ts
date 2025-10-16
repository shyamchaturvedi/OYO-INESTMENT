import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { KYCStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    // Extract form fields
    const panCard = formData.get('panCard') as string
    const bankDetails = formData.get('bankDetails') as string
    const upiId = formData.get('upiId') as string

    // Extract files
    const aadharFront = formData.get('aadharFront') as File
    const aadharBack = formData.get('aadharBack') as File

    // Validation
    if (!panCard || !bankDetails) {
      return NextResponse.json({ error: 'PAN card and bank details are required' }, { status: 400 })
    }

    if (!aadharFront || !aadharBack) {
      return NextResponse.json({ error: 'Aadhaar documents are required' }, { status: 400 })
    }

    // Validate PAN format
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard)) {
      return NextResponse.json({ error: 'Invalid PAN card format' }, { status: 400 })
    }

    // Parse bank details
    let bankDetailsObj
    try {
      bankDetailsObj = JSON.parse(bankDetails)
    } catch {
      return NextResponse.json({ error: 'Invalid bank details format' }, { status: 400 })
    }

    // Validate bank details
    if (!bankDetailsObj.accountNumber || !bankDetailsObj.ifsc || !bankDetailsObj.bankName) {
      return NextResponse.json({ error: 'All bank details are required' }, { status: 400 })
    }

    // Validate IFSC format
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetailsObj.ifsc)) {
      return NextResponse.json({ error: 'Invalid IFSC code format' }, { status: 400 })
    }

    // Check if user already has a pending or approved KYC
    const existingKYC = await db.kYCDocument.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['PENDING', 'APPROVED']
        }
      }
    })

    if (existingKYC) {
      return NextResponse.json({ 
        error: existingKYC.status === 'PENDING' 
          ? 'KYC application is already under review' 
          : 'KYC is already approved' 
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'kyc', session.user.id)
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Save files
    const saveFile = async (file: File, prefix: string) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const timestamp = Date.now()
      const filename = `${prefix}_${timestamp}_${file.name}`
      const filepath = join(uploadsDir, filename)
      
      await writeFile(filepath, buffer)
      return `/uploads/kyc/${session.user.id}/${filename}`
    }

    const aadharFrontPath = await saveFile(aadharFront, 'aadhar_front')
    const aadharBackPath = await saveFile(aadharBack, 'aadhar_back')

    // Create KYC document record
    const kycDocument = await db.kYCDocument.create({
      data: {
        userId: session.user.id,
        panNumber: panCard.toUpperCase(),
        bankDetails: bankDetails,
        upiId: upiId || null,
        aadharFront: aadharFrontPath,
        aadharBack: aadharBackPath,
        status: KYCStatus.PENDING,
        submittedAt: new Date()
      }
    })

    // Update user KYC status
    await db.user.update({
      where: { id: session.user.id },
      data: { kycStatus: KYCStatus.PENDING }
    })

    // Create notification for user
    await db.notification.create({
      data: {
        userId: session.user.id,
        title: 'KYC Submitted',
        message: 'Your KYC documents have been submitted successfully. We will review them within 1-2 business days.',
        type: 'KYC'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'KYC documents submitted successfully',
      kycId: kycDocument.id,
      userId: session.user.id
    })

  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json({ 
      error: 'Failed to submit KYC documents' 
    }, { status: 500 })
  }
}