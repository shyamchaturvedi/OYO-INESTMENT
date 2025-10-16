import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(50, 'Full name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number (must be 10 digits starting with 6-9)'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must be less than 100 characters'),
  referredBy: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { mobile: validatedData.mobile },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or mobile already exists' },
        { status: 400 }
      )
    }

    // Validate referral code if provided
    if (validatedData.referredBy && validatedData.referredBy.trim() !== '') {
      const referrer = await db.user.findUnique({
        where: { referralCode: validatedData.referredBy.trim() },
      })

      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        )
      }
    }

    // Create user
    const user = await createUser({
      ...validatedData,
      referredBy: validatedData.referredBy?.trim() || undefined,
    })

    return NextResponse.json({
      message: 'User registered successfully',
      user,
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.issues)
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    // Log Prisma errors specifically
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error occurred. Please try again.' },
        { status: 500 }
      )
    }

    console.error('Unknown registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}