// MongoDB Atlas connection test utility
import { MongoClient } from 'mongodb'

export async function testMongoDBAtlasConnection(): Promise<boolean> {
  const mongoUrl = process.env.MONGODB_ATLAS_URL
  
  if (!mongoUrl) {
    console.log('MongoDB Atlas URL not found in environment variables')
    return false
  }

  try {
    console.log('Testing MongoDB Atlas connection...')
    const client = new MongoClient(mongoUrl)
    
    // Test connection with timeout
    const connectPromise = client.connect()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    )
    
    await Promise.race([connectPromise, timeoutPromise])
    
    // Test database access
    const db = client.db()
    await db.admin().ping()
    
    await client.close()
    console.log('✅ MongoDB Atlas connection successful!')
    return true
  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:', error.message)
    return false
  }
}

export async function getMongoDBAtlasInfo() {
  const mongoUrl = process.env.MONGODB_ATLAS_URL
  
  if (!mongoUrl) {
    return { error: 'MongoDB Atlas URL not configured' }
  }

  try {
    const client = new MongoClient(mongoUrl)
    await client.connect()
    
    const db = client.db()
    const admin = db.admin()
    
    // Get server info
    const serverStatus = await admin.serverStatus()
    const databases = await admin.listDatabases()
    
    await client.close()
    
    return {
      success: true,
      host: mongoUrl.split('@')[1]?.split('/')[0] || 'Unknown',
      database: mongoUrl.split('/').pop()?.split('?')[0] || 'investment',
      version: serverStatus.version,
      databases: databases.databases.length,
      totalSize: databases.databases.reduce((sum, db) => sum + (db.sizeOnDisk || 0), 0)
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}