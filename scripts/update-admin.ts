import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateAdminAccount() {
  try {
    // Delete all existing admin users
    await prisma.user.deleteMany({
      where: {
        role: 'ADMIN'
      }
    })

    // Create the single admin account
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const admin = await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email: 'iammshyam@gmail.com',
        mobile: '9876543210',
        password: hashedPassword,
        referralCode: 'ADMIN001',
        role: 'ADMIN',
        status: 'ACTIVE',
        walletBalance: 0,
        totalEarnings: 0,
        kycStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: true,
      }
    })

    console.log('Admin account updated successfully:')
    console.log('Email: iammshyam@gmail.com')
    console.log('Password: 123456')
    console.log('Admin ID:', admin.id)

  } catch (error) {
    console.error('Error updating admin account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminAccount()