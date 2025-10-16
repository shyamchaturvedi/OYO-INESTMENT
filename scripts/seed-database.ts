// Database seeding script for PowerOYO platform
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await prisma.roiHistory.deleteMany()
    // await prisma.referralCommission.deleteMany()
    // await prisma.transaction.deleteMany()
    // await prisma.investment.deleteMany()
    // await prisma.investmentPlan.deleteMany()
    // await prisma.user.deleteMany()

    // 1. Create Investment Plans
    console.log('📋 Creating investment plans...')
    const plans = await Promise.all([
      prisma.investmentPlan.create({
        data: {
          name: 'Basic Plan',
          amount: 50,
          dailyROI: 7.5, // 15% daily ROI
          duration: 30,
          status: 'ACTIVE',
          description: 'Perfect starter plan for beginners'
        }
      }),
      prisma.investmentPlan.create({
        data: {
          name: 'Standard Plan',
          amount: 100,
          dailyROI: 15, // 15% daily ROI
          duration: 30,
          status: 'ACTIVE',
          description: 'Most popular choice for regular investors'
        }
      }),
      prisma.investmentPlan.create({
        data: {
          name: 'Premium Plan',
          amount: 200,
          dailyROI: 30, // 15% daily ROI
          duration: 30,
          status: 'ACTIVE',
          description: 'Maximum returns for serious investors'
        }
      }),
      prisma.investmentPlan.create({
        data: {
          name: 'Gold Plan',
          amount: 500,
          dailyROI: 75, // 15% daily ROI
          duration: 30,
          status: 'ACTIVE',
          description: 'Premium plan for high-value investors'
        }
      }),
      prisma.investmentPlan.create({
        data: {
          name: 'Diamond Plan',
          amount: 1000,
          dailyROI: 150, // 15% daily ROI
          duration: 30,
          status: 'ACTIVE',
          description: 'Elite investment plan with maximum earnings'
        }
      })
    ])

    console.log(`✅ Created ${plans.length} investment plans`)

    // 2. Create Sample Users
    console.log('👥 Creating sample users...')
    const hashedPassword = await bcrypt.hash('password123', 10)

    const demoUser = await prisma.user.create({
      data: {
        fullName: 'Demo Investor',
        email: 'demo@poweroyo.com',
        mobile: '9876543210',
        password: hashedPassword,
        referralCode: 'DEMO' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        referredBy: null,
        role: 'USER',
        status: 'ACTIVE',
        walletBalance: 250.50,
        totalEarnings: 1250.75,
        kycStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: true
      }
    })

    // Create referred users for MLM demonstration
    const referredUser1 = await prisma.user.create({
      data: {
        fullName: 'Referred User 1',
        email: 'user1@poweroyo.com',
        mobile: '9876543211',
        password: hashedPassword,
        referralCode: 'USER' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        referredBy: demoUser.referralCode,
        role: 'USER',
        status: 'ACTIVE',
        walletBalance: 100.25,
        totalEarnings: 450.00,
        kycStatus: 'APPROVED',
        emailVerified: true,
        mobileVerified: true
      }
    })

    const referredUser2 = await prisma.user.create({
      data: {
        fullName: 'Referred User 2',
        email: 'user2@poweroyo.com',
        mobile: '9876543212',
        password: hashedPassword,
        referralCode: 'USER' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        referredBy: demoUser.referralCode,
        role: 'USER',
        status: 'ACTIVE',
        walletBalance: 75.00,
        totalEarnings: 325.50,
        kycStatus: 'PENDING',
        emailVerified: true,
        mobileVerified: false
      }
    })

    console.log(`✅ Created 3 sample users`)

    // 3. Create Investments for Demo User
    console.log('💰 Creating investments...')
    const investments = await Promise.all([
      prisma.investment.create({
        data: {
          userId: demoUser.id,
          planId: plans[1].id, // Standard Plan
          amount: 100,
          dailyROI: 15,
          totalDays: 30,
          remainingDays: 15,
          totalEarned: 225, // 15 days × 15 = 225
          status: 'ACTIVE',
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
          lastROIDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
        }
      }),
      prisma.investment.create({
        data: {
          userId: demoUser.id,
          planId: plans[2].id, // Premium Plan
          amount: 200,
          dailyROI: 30,
          totalDays: 30,
          remainingDays: 20,
          totalEarned: 300, // 10 days × 30 = 300
          status: 'ACTIVE',
          startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
          lastROIDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Yesterday
        }
      }),
      prisma.investment.create({
        data: {
          userId: demoUser.id,
          planId: plans[0].id, // Basic Plan
          amount: 50,
          dailyROI: 7.5,
          totalDays: 30,
          remainingDays: 0,
          totalEarned: 225, // 30 days × 7.5 = 225 (completed)
          status: 'COMPLETED',
          startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
          endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          lastROIDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      })
    ])

    console.log(`✅ Created ${investments.length} investments`)

    // 4. Create ROI History
    console.log('📈 Creating ROI history...')
    const roiHistory = []
    
    // Generate ROI history for the last 15 days for active investments
    for (let i = 0; i < 15; i++) {
      const date = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
      
      // ROI for Standard Plan investment
      roiHistory.push({
        investmentId: investments[0].id,
        userId: demoUser.id,
        amount: 15,
        creditedAt: date,
        createdAt: date
      })
      
      // ROI for Premium Plan investment (only last 10 days)
      if (i < 10) {
        roiHistory.push({
          investmentId: investments[1].id,
          userId: demoUser.id,
          amount: 30,
          creditedAt: date,
          createdAt: date
        })
      }
    }

    await prisma.roiHistory.createMany({
      data: roiHistory
    })

    console.log(`✅ Created ${roiHistory.length} ROI records`)

    // 5. Create Transactions
    console.log('💳 Creating transactions...')
    const transactions = [
      {
        userId: demoUser.id,
        type: 'INVESTMENT' as const,
        amount: 100,
        description: 'Investment in Standard Plan',
        status: 'COMPLETED' as const,
        referenceId: investments[0].id,
        createdAt: investments[0].createdAt
      },
      {
        userId: demoUser.id,
        type: 'INVESTMENT' as const,
        amount: 200,
        description: 'Investment in Premium Plan',
        status: 'COMPLETED' as const,
        referenceId: investments[1].id,
        createdAt: investments[1].createdAt
      },
      {
        userId: demoUser.id,
        type: 'INVESTMENT' as const,
        amount: 50,
        description: 'Investment in Basic Plan',
        status: 'COMPLETED' as const,
        referenceId: investments[2].id,
        createdAt: investments[2].createdAt
      },
      {
        userId: demoUser.id,
        type: 'ROI' as const,
        amount: 45,
        description: 'Daily ROI earnings',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        type: 'REFERRAL' as const,
        amount: 25,
        description: 'Referral commission from user1@poweroyo.com',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        type: 'WITHDRAWAL' as const,
        amount: 100,
        description: 'Withdrawal to UPI',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]

    await prisma.transaction.createMany({
      data: transactions
    })

    console.log(`✅ Created ${transactions.length} transactions`)

    // 6. Create Referral Commissions
    console.log('🎁 Creating referral commissions...')
    const referralCommissions = [
      {
        userId: demoUser.id,
        fromUserId: referredUser1.id,
        investmentId: null, // Will be updated when user1 makes investment
        level: 1,
        percentage: 10,
        amount: 10,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        fromUserId: referredUser2.id,
        investmentId: null,
        level: 1,
        percentage: 10,
        amount: 5,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]

    await prisma.referralCommission.createMany({
      data: referralCommissions
    })

    console.log(`✅ Created ${referralCommissions.length} referral commissions`)

    // 7. Create Sample Withdrawal
    console.log('💸 Creating withdrawal request...')
    await prisma.withdrawal.create({
      data: {
        userId: demoUser.id,
        amount: 150,
        method: 'UPI' as const,
        details: 'demo@upi',
        status: 'PENDING' as const,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    })

    console.log('✅ Created withdrawal request')

    // 8. Create Notifications
    console.log('🔔 Creating notifications...')
    const notifications = [
      {
        userId: demoUser.id,
        title: 'Investment Active',
        message: 'Your Standard Plan investment is now active and earning daily ROI.',
        type: 'INVESTMENT' as const,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        title: 'ROI Credited',
        message: '₹45 has been credited to your wallet as daily ROI.',
        type: 'ROI' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        title: 'New Referral',
        message: `Congratulations! A new user joined using your referral code: ${demoUser.referralCode}`,
        type: 'REFERRAL' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ]

    await prisma.notification.createMany({
      data: notifications
    })

    console.log(`✅ Created ${notifications.length} notifications`)

    // 9. Create System Settings
    console.log('⚙️ Creating system settings...')
    const systemSettings = [
      {
        key: 'MIN_WITHDRAWAL',
        value: '100',
        description: 'Minimum withdrawal amount'
      },
      {
        key: 'MAX_WITHDRAWAL',
        value: '50000',
        description: 'Maximum withdrawal amount per day'
      },
      {
        key: 'REFERRAL_LEVEL_1',
        value: '10',
        description: 'Level 1 referral commission percentage'
      },
      {
        key: 'REFERRAL_LEVEL_2',
        value: '5',
        description: 'Level 2 referral commission percentage'
      },
      {
        key: 'REFERRAL_LEVEL_3',
        value: '3',
        description: 'Level 3 referral commission percentage'
      },
      {
        key: 'REFERRAL_LEVEL_4',
        value: '2',
        description: 'Level 4 referral commission percentage'
      },
      {
        key: 'REFERRAL_LEVEL_5',
        value: '1',
        description: 'Level 5 referral commission percentage'
      },
      {
        key: 'MAINTENANCE_MODE',
        value: 'false',
        description: 'Site maintenance mode status'
      }
    ]

    await prisma.systemSettings.createMany({
      data: systemSettings
    })

    console.log(`✅ Created ${systemSettings.length} system settings`)

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Investment Plans: ${plans.length}`)
    console.log(`   Users: 3`)
    console.log(`   Investments: ${investments.length}`)
    console.log(`   ROI Records: ${roiHistory.length}`)
    console.log(`   Transactions: ${transactions.length}`)
    console.log(`   Referral Commissions: ${referralCommissions.length}`)
    console.log(`   Notifications: ${notifications.length}`)
    console.log(`   System Settings: ${systemSettings.length}`)
    
    console.log('\n👤 Demo Login Credentials:')
    console.log('   Email: demo@poweroyo.com')
    console.log('   Password: password123')
    console.log(`   Referral Code: ${demoUser.referralCode}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error)
      process.exit(1)
    })
}

export default seedDatabase