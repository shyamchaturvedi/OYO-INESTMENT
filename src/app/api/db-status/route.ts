import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseStatus, checkMongoDBAvailability, getMigrationSteps, getCurrentDatabaseInfo } from '@/lib/db-status'
import { testMongoDBAtlasConnection, getMongoDBAtlasInfo } from '@/lib/mongodb-test'
import { getCurrentMongoDBStatus, getMongoDBAtlasInstructions } from '@/lib/mongodb-helper'

export async function GET(request: NextRequest) {
  try {
    const [dbStatus, mongoAvailable, currentInfo] = await Promise.all([
      getDatabaseStatus(),
      checkMongoDBAvailability(),
      getCurrentDatabaseInfo()
    ])

    // Get MongoDB Atlas configuration status
    const mongoAtlasConfig = getCurrentMongoDBStatus()

    // Test MongoDB Atlas connection if configured and valid
    let mongoAtlasInfo = null
    if (mongoAtlasConfig.configured && mongoAtlasConfig.validation?.valid) {
      mongoAtlasInfo = await getMongoDBAtlasInfo()
    }

    const migrationSteps = getMigrationSteps()

    return NextResponse.json({
      status: 'success',
      database: {
        current: currentInfo,
        connection: dbStatus,
        mongoDB: {
          available: mongoAvailable,
          configured: !!process.env.MONGODB_URL || !!process.env.MONGODB_ATLAS_URL,
          atlas: {
            config: mongoAtlasConfig,
            connection: mongoAtlasInfo,
            instructions: getMongoDBAtlasInstructions()
          }
        }
      },
      migration: {
        ready: dbStatus.migrationReady,
        steps: migrationSteps
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database status check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}