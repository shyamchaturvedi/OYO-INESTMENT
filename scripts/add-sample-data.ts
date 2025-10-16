// Simple script to add sample data to PowerOYO platform
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addSampleData() {
  try {
    console.log('🌱 Adding sample data to PowerOYO...')

    // 1. Add Investment Plans (if they don't exist)
    console.log('📋 Adding investment plans...')
    
    const existingPlans = await prisma.investmentPlan.findMany()
    if (existingPlans.length === 0) {
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
    } else {
      console.log(`ℹ️  Investment plans already exist (${existingPlans.length} found)`)
    }

    // 2. Add System Settings (if they don't exist)
    console.log('⚙️ Adding system settings...')
    
    const existingSettings = await prisma.systemSettings.findMany()
    if (existingSettings.length === 0) {
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
    } else {
      console.log(`ℹ️  System settings already exist (${existingSettings.length} found)`)
    }

    // 3. Check existing users
    const existingUsers = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        referralCode: true,
        walletBalance: true,
        totalEarnings: true,
        status: true,
        kycStatus: true
      }
    })

    // Get counts separately
    const usersWithCounts = await Promise.all(
      existingUsers.map(async (user) => {
        const [investmentCount, transactionCount] = await Promise.all([
          prisma.investment.count({ where: { userId: user.id } }),
          prisma.transaction.count({ where: { userId: user.id } })
        ])
        
        return {
          ...user,
          _count: {
            investments: investmentCount,
            transactions: transactionCount
          }
        }
      })
    )

    console.log(`ℹ️  Found ${usersWithCounts.length} existing users:`)
    usersWithCounts.forEach(user => {
      console.log(`   👤 ${user.fullName} (${user.email})`)
      console.log(`      Referral: ${user.referralCode}`)
      console.log(`      Wallet: ₹${user.walletBalance} | Earnings: ₹${user.totalEarnings}`)
      console.log(`      Investments: ${user._count.investments} | Transactions: ${user._count.transactions}`)
      console.log('')
    })

    // 4. Display investment plans
    const allPlans = await prisma.investmentPlan.findMany({
      orderBy: { amount: 'asc' }
    })

    console.log('📊 Available Investment Plans:')
    allPlans.forEach(plan => {
      const totalReturn = plan.amount + (plan.dailyROI * plan.duration)
      const roiPercentage = ((plan.dailyROI / plan.amount) * 100).toFixed(1)
      console.log(`   💰 ${plan.name}: ₹${plan.amount} → ₹${plan.dailyROI}/day (${roiPercentage}% ROI)`)
      console.log(`      Duration: ${plan.duration} days | Total Return: ₹${totalReturn}`)
      console.log('')
    })

    console.log('🎉 Sample data setup completed!')
    console.log('\n📝 Summary:')
    console.log(`   Investment Plans: ${allPlans.length}`)
    console.log(`   Users: ${usersWithCounts.length}`)
    console.log(`   System Settings: ${existingSettings.length || 'Not created yet'}`)

    if (usersWithCounts.length > 0) {
      console.log('\n🔗 You can now:')
      console.log('   1. Register new users')
      console.log('   2. Make investments')
      console.log('   3. Test dashboard functionality')
      console.log('   4. View transaction history')
    }

  } catch (error) {
    console.error('❌ Error adding sample data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
if (require.main === module) {
  addSampleData()
    .then(() => {
      console.log('\n✅ Sample data added successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Failed to add sample data:', error)
      process.exit(1)
    })
}

export default addSampleData