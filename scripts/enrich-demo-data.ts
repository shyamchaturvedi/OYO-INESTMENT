// Script to enrich existing demo data with transactions and ROI history
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function enrichDemoData() {
  try {
    console.log('🎨 Enriching demo data...')

    // Find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@poweroyo.com' }
    })

    if (!demoUser) {
      console.log('❌ Demo user not found. Please run add-sample-data.ts first.')
      return
    }

    console.log(`👤 Found demo user: ${demoUser.fullName} (${demoUser.referralCode})`)

    // Get existing investments for demo user
    const investments = await prisma.investment.findMany({
      where: { userId: demoUser.id },
      include: { plan: true }
    })

    console.log(`💰 Found ${investments.length} existing investments`)

    // Add transactions for investments
    console.log('💳 Adding investment transactions...')
    
    for (const investment of investments) {
      try {
        await prisma.transaction.create({
          data: {
            userId: demoUser.id,
            type: 'INVESTMENT',
            amount: investment.amount,
            description: `Investment in ${investment.plan.name}`,
            status: 'COMPLETED',
            referenceId: investment.id,
            createdAt: investment.createdAt
          }
        })
      } catch (error) {
        // Transaction might already exist, continue
        console.log(`ℹ️  Investment transaction already exists for ${investment.plan.name}`)
      }
    }

    console.log(`✅ Processed ${investments.length} investment transactions`)

    // Add ROI history for active investments
    console.log('📈 Adding ROI history...')
    const roiHistory = []
    const now = new Date()

    for (const investment of investments) {
      if (investment.status === 'ACTIVE' && investment.remainingDays > 0) {
        // Generate ROI for the past days
        const daysPassed = investment.totalDays - investment.remainingDays
        
        for (let day = 1; day <= Math.min(daysPassed, 30); day++) {
          const roiDate = new Date(investment.startDate)
          roiDate.setDate(roiDate.getDate() + day)
          
          // Only add ROI if it's not in the future
          if (roiDate <= now) {
            roiHistory.push({
              investmentId: investment.id,
              userId: demoUser.id,
              amount: investment.dailyROI,
              creditedAt: roiDate,
              createdAt: roiDate
            })
          }
        }
      }
    }

    if (roiHistory.length > 0) {
      for (const roi of roiHistory) {
        try {
          await prisma.roiHistory.create({ data: roi })
        } catch (error) {
          // ROI might already exist, continue
        }
      }
      console.log(`✅ Added ${roiHistory.length} ROI records`)
    } else {
      console.log('ℹ️  No ROI history to add')
    }

    // Add some sample transactions
    console.log('💰 Adding sample transactions...')
    const sampleTransactions = [
      {
        userId: demoUser.id,
        type: 'ROI' as const,
        amount: 45,
        description: 'Daily ROI earnings from investments',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        type: 'REFERRAL' as const,
        amount: 25,
        description: 'Referral commission from new user signup',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        type: 'WITHDRAWAL' as const,
        amount: 100,
        description: 'Withdrawal to UPI account',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        type: 'BONUS' as const,
        amount: 50,
        description: 'Welcome bonus for joining PowerOYO',
        status: 'COMPLETED' as const,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ]

    let addedTransactions = 0
    for (const transaction of sampleTransactions) {
      try {
        await prisma.transaction.create({ data: transaction })
        addedTransactions++
      } catch (error) {
        // Transaction might already exist, continue
      }
    }

    console.log(`✅ Added ${addedTransactions} sample transactions`)

    // Add withdrawal request
    console.log('💸 Adding withdrawal request...')
    const existingWithdrawal = await prisma.withdrawal.findFirst({
      where: { userId: demoUser.id, status: 'PENDING' }
    })

    if (!existingWithdrawal) {
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
      console.log('✅ Added withdrawal request')
    } else {
      console.log('ℹ️  Withdrawal request already exists')
    }

    // Add notifications
    console.log('🔔 Adding notifications...')
    const notifications = [
      {
        userId: demoUser.id,
        title: 'Investment Active',
        message: 'Your investments are now active and earning daily ROI.',
        type: 'INVESTMENT' as const,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        title: 'Daily ROI Credited',
        message: '₹45 has been credited to your wallet as daily ROI earnings.',
        type: 'ROI' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        title: 'Referral Commission',
        message: 'Congratulations! You earned ₹25 from a new referral.',
        type: 'REFERRAL' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        title: 'Withdrawal Processed',
        message: 'Your withdrawal request of ₹100 has been processed successfully.',
        type: 'WITHDRAWAL' as const,
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ]

    let addedNotifications = 0
    for (const notification of notifications) {
      try {
        await prisma.notification.create({ data: notification })
        addedNotifications++
      } catch (error) {
        // Notification might already exist, continue
      }
    }

    console.log(`✅ Added ${addedNotifications} notifications`)

    // Add referral commissions
    console.log('🎁 Adding referral commissions...')
    const referralCommissions = [
      {
        userId: demoUser.id,
        fromUserId: null, // Will be updated when we have referred users with investments
        investmentId: investments[0]?.id || null,
        level: 1,
        percentage: 10,
        amount: 10,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: demoUser.id,
        fromUserId: null,
        investmentId: investments[1]?.id || null,
        level: 1,
        percentage: 10,
        amount: 20,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]

    let addedCommissions = 0
    for (const commission of referralCommissions) {
      try {
        await prisma.referralCommission.create({ data: commission })
        addedCommissions++
      } catch (error) {
        // Commission might already exist, continue
      }
    }

    console.log(`✅ Added ${addedCommissions} referral commissions`)

    // Get updated statistics
    const [investmentCount, transactionCount, notificationCount] = await Promise.all([
      prisma.investment.count({ where: { userId: demoUser.id } }),
      prisma.transaction.count({ where: { userId: demoUser.id } }),
      prisma.notification.count({ where: { userId: demoUser.id } })
    ])

    console.log('\n🎉 Demo data enrichment completed!')
    console.log('\n📊 Updated Statistics:')
    console.log(`   Investments: ${investmentCount}`)
    console.log(`   Transactions: ${transactionCount}`)
    console.log(`   Notifications: ${notificationCount}`)
    console.log(`   ROI Records: ${roiHistory.length}`)

    console.log('\n🔗 Demo Dashboard is now ready with:')
    console.log('   ✅ Active investments with daily ROI')
    console.log('   ✅ Transaction history')
    console.log('   ✅ ROI earnings history')
    console.log('   ✅ Referral commissions')
    console.log('   ✅ Pending withdrawal')
    console.log('   ✅ Notifications')

    console.log('\n👤 Login Credentials:')
    console.log('   Email: demo@poweroyo.com')
    console.log('   Password: password123')
    console.log(`   Referral Code: ${demoUser.referralCode}`)

  } catch (error) {
    console.error('❌ Error enriching demo data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
if (require.main === module) {
  enrichDemoData()
    .then(() => {
      console.log('\n✅ Demo data enriched successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Failed to enrich demo data:', error)
      process.exit(1)
    })
}

export default enrichDemoData