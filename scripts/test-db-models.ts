// Test script to verify database models are working
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testModels() {
  try {
    console.log('🔍 Testing database models...')
    
    // Test basic connection
    console.log('✅ Prisma client connected')
    
    // Test each model
    const models = [
      { name: 'user', field: 'user' },
      { name: 'investment', field: 'investment' },
      { name: 'investmentPlan', field: 'investmentPlan' },
      { name: 'transaction', field: 'transaction' },
      { name: 'roiHistory', field: 'roiHistory' },
      { name: 'notification', field: 'notification' },
      { name: 'withdrawal', field: 'withdrawal' },
      { name: 'referralCommission', field: 'referralCommission' }
    ]
    
    for (const { name, field } of models) {
      try {
        // @ts-ignore - dynamic model access
        const model = prisma[field]
        if (model && typeof model.findMany === 'function') {
          console.log(`✅ ${name} model available`)
        } else {
          console.log(`❌ ${name} model not available or missing findMany`)
        }
      } catch (error) {
        console.log(`❌ Error accessing ${name}: ${error.message}`)
      }
    }
    
    // Test specific queries
    console.log('\n🧪 Testing specific queries...')
    
    const userCount = await prisma.user.count()
    console.log(`✅ User count: ${userCount}`)
    
    const investmentCount = await prisma.investment.count()
    console.log(`✅ Investment count: ${investmentCount}`)
    
    // This should reveal the issue
    try {
      const transactionCount = await prisma.transaction.count()
      console.log(`✅ Transaction count: ${transactionCount}`)
    } catch (error) {
      console.log(`❌ Transaction query failed: ${error.message}`)
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testModels()