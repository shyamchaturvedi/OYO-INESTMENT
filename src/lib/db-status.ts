import { db } from './db'
import { getDatabaseConfig, testMongoDBConnection } from './db-config'

export interface DatabaseStatus {
  provider: string
  url: string
  connected: boolean
  error?: string
  migrationReady: boolean
}

export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  const config = getDatabaseConfig()
  
  try {
    // Test basic database connection
    await db.user.count()
    
    return {
      provider: config.type,
      url: config.url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      connected: true,
      migrationReady: config.type === 'sqlite' // SQLite is ready for migration
    }
  } catch (error) {
    return {
      provider: config.type,
      url: config.url.replace(/\/\/.*@/, '//***:***@'),
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      migrationReady: false
    }
  }
}

export async function checkMongoDBAvailability(): Promise<boolean> {
  const mongoUrl = process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URL
  if (!mongoUrl) return false
  
  return await testMongoDBConnection(mongoUrl)
}

export function getMigrationSteps(): string[] {
  return [
    "1. Install MongoDB locally or set up MongoDB Atlas",
    "2. Update DATABASE_URL in .env file",
    "3. Update Prisma schema for MongoDB compatibility",
    "4. Run 'npx prisma generate'",
    "5. Run 'npx prisma db push'",
    "6. Test application functionality",
    "7. Update any MongoDB-specific query optimizations"
  ]
}

export function getCurrentDatabaseInfo(): {
  type: string
  provider: string
  url: string
  features: string[]
} {
  const config = getDatabaseConfig()
  
  if (config.type === 'sqlite') {
    return {
      type: 'SQLite',
      provider: 'sqlite',
      url: config.url,
      features: [
        'Full SQL support',
        'Foreign key constraints',
        'Transactions',
        'Easy migration path to MongoDB',
        'Local file storage'
      ]
    }
  } else {
    return {
      type: 'MongoDB',
      provider: 'mongodb',
      url: config.url.replace(/\/\/.*@/, '//***:***@'),
      features: [
        'NoSQL document storage',
        'Horizontal scaling',
        'Flexible schema',
        'Cloud hosting options',
        'Aggregation pipelines'
      ]
    }
  }
}