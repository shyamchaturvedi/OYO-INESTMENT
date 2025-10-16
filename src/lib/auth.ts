import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function generateReferralCode(name: string): string {
  const cleanName = name.toUpperCase().replace(/[^A-Z]/g, '')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${cleanName.substring(0, 4)}${random}`
}

export async function createUser(userData: {
  fullName: string
  email: string
  mobile: string
  password: string
  referredBy?: string
}) {
  const hashedPassword = await hashPassword(userData.password)
  const referralCode = generateReferralCode(userData.fullName)

  // Only include referredBy if it's provided and valid
  const createData: any = {
    fullName: userData.fullName,
    email: userData.email,
    mobile: userData.mobile,
    password: hashedPassword,
    referralCode,
  }

  // Validate referral code if provided
  if (userData.referredBy && userData.referredBy.trim() !== '') {
    const referrer = await db.user.findUnique({
      where: { referralCode: userData.referredBy.trim() },
    })

    if (!referrer) {
      throw new Error('Invalid referral code')
    }

    createData.referredBy = userData.referredBy.trim()
  }

  return db.user.create({
    data: createData,
    select: {
      id: true,
      fullName: true,
      email: true,
      mobile: true,
      referralCode: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    referralCode: user.referralCode,
    role: user.role,
    status: user.status,
    walletBalance: user.walletBalance,
    totalEarnings: user.totalEarnings,
    kycStatus: user.kycStatus,
  }
}