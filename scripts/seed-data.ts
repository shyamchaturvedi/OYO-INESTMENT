import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create admin user
    const adminPassword = await hashPassword('admin123')
    const admin = await prisma.user.upsert({
      where: { email: 'admin@poweroyo.in' },
      update: {},
      create: {
        fullName: 'Admin User',
        email: 'admin@poweroyo.in',
        mobile: '9999999999',
        password: adminPassword,
        referralCode: 'ADMIN123',
        role: 'ADMIN',
        kycStatus: 'APPROVED',
        walletBalance: 10000,
        totalEarnings: 50000,
      },
    })

    console.log('✅ Admin user created:', admin.email)

    // Create investment plans
    const plans = [
      {
        name: 'Basic Plan',
        amount: 50,
        dailyROI: 7.5,
        duration: 30,
        description: 'Perfect for beginners - Start with just ₹50 and earn ₹7.5 daily for 30 days',
      },
      {
        name: 'Standard Plan',
        amount: 100,
        dailyROI: 15,
        duration: 30,
        description: 'Most popular choice - Invest ₹100 and earn ₹15 daily for 30 days',
      },
      {
        name: 'Premium Plan',
        amount: 200,
        dailyROI: 30,
        duration: 30,
        description: 'Best value - Invest ₹200 and earn ₹30 daily for 30 days',
      },
      {
        name: 'Gold Plan',
        amount: 500,
        dailyROI: 75,
        duration: 30,
        description: 'For serious investors - Invest ₹500 and earn ₹75 daily for 30 days',
      },
      {
        name: 'Platinum Plan',
        amount: 1000,
        dailyROI: 150,
        duration: 30,
        description: 'Maximum returns - Invest ₹1000 and earn ₹150 daily for 30 days',
      },
    ]

    for (const plan of plans) {
      await prisma.investmentPlan.create({
        data: plan,
      })
    }

    console.log('✅ Investment plans created')

    // Create sample users
    const sampleUsers = [
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        mobile: '9876543210',
        password: 'password123',
        referralCode: 'JOHN1234',
        referredBy: 'ADMIN123',
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        mobile: '9876543211',
        password: 'password123',
        referralCode: 'JANE5678',
        referredBy: 'JOHN1234',
      },
      {
        fullName: 'Mike Johnson',
        email: 'mike@example.com',
        mobile: '9876543212',
        password: 'password123',
        referralCode: 'MIKE9012',
        referredBy: 'JANE5678',
      },
    ]

    for (const user of sampleUsers) {
      const hashedPassword = await hashPassword(user.password)
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          password: hashedPassword,
          kycStatus: 'APPROVED',
          walletBalance: Math.floor(Math.random() * 5000) + 1000,
          totalEarnings: Math.floor(Math.random() * 10000) + 2000,
        },
      })
    }

    console.log('✅ Sample users created')

    // Create system settings
    const settings = [
      {
        key: 'company_name',
        value: 'PowerOYO',
        description: 'Company name displayed throughout the platform',
      },
      {
        key: 'min_withdrawal',
        value: '100',
        description: 'Minimum withdrawal amount in rupees',
      },
      {
        key: 'max_withdrawal',
        value: '50000',
        description: 'Maximum withdrawal amount per day in rupees',
      },
      {
        key: 'welcome_bonus',
        value: '10',
        description: 'Welcome bonus for new users in rupees',
      },
      {
        key: 'upi_id',
        value: 'poweroyo@ybl',
        description: 'Company UPI ID for payments',
      },
      {
        key: 'support_email',
        value: 'support@poweroyo.in',
        description: 'Customer support email',
      },
      {
        key: 'support_phone',
        value: '+91 98765 43210',
        description: 'Customer support phone number',
      },
    ]

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    }

    console.log('✅ System settings created')

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Admin: admin@poweroyo.in / admin123')
    console.log('User1: john@example.com / password123')
    console.log('User2: jane@example.com / password123')
    console.log('User3: mike@example.com / password123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()