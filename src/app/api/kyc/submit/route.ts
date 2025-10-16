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
    const aadharNumber = formData.get('aadharNumber') as string
    const panNumber = formData.get('panNumber') as string
    const nomineeName = formData.get('nomineeName') as string
    const nomineeRelation = formData.get('nomineeRelation') as string
    const declaration = formData.get('declaration') === 'true'

    // Extract files
    const aadharFront = formData.get('aadharFront') as File
    const aadharBack = formData.get('aadharBack') as File
    const panCard = formData.get('panCard') as File

    // Validation
    if (!aadharNumber || !panNumber || !nomineeName || !nomineeRelation || !declaration) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!aadharFront || !aadharBack || !panCard) {
      return NextResponse.json({ error: 'All documents are required' }, { status: 400 })
    }

    // Validate Aadhar and PAN formats
    if (aadharNumber.replace(/\D/g, '').length !== 12) {
      return NextResponse.json({ error: 'Invalid Aadhar number' }, { status: 400 })
    }

    if (panNumber.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
      return NextResponse.json({ error: 'Invalid PAN number format' }, { status: 400 })
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
    const panCardPath = await saveFile(panCard, 'pan_card')

    // Create KYC document record
    const kycDocument = await db.kYCDocument.create({
      data: {
        userId: session.user.id,
        aadharNumber: aadharNumber.replace(/\D/g, ''),
        panNumber: panNumber.toUpperCase(),
        nomineeName,
        nomineeRelation,
        aadharFront: aadharFrontPath,
        aadharBack: aadharBackPath,
        panCard: panCardPath,
        declaration,
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
      kycId: kycDocument.id
    })

  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json({ 
      error: 'Failed to submit KYC documents' 
    }, { status: 500 })
  }
}