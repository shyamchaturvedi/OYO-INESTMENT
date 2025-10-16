import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        referralCode: true,
        role: true,
        status: true,
        walletBalance: true,
        totalEarnings: true,
        kycStatus: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    if (!user || user.status === 'BLOCKED') {
      return NextResponse.json(
        { error: 'User not found or blocked' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      user: {
        ...user,
        walletBalance: Number(user.walletBalance),
        totalEarnings: Number(user.totalEarnings)
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    )
  }
}