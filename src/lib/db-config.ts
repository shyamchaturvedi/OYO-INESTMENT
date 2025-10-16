// Database configuration for MongoDB migration
// This file helps with the transition from SQLite to MongoDB

interface DatabaseConfig {
  type: 'sqlite' | 'mongodb'
  url: string
  isMongoDBAvailable: boolean
}

// Current database configuration
const currentConfig: DatabaseConfig = {
  type: 'sqlite', // Currently using SQLite
  url: process.env.DATABASE_URL || 'file:./dev.db',
  isMongoDBAvailable: false
}

// MongoDB configuration (for when MongoDB is available)
const mongoDBConfig: DatabaseConfig = {
  type: 'mongodb',
  url: process.env.MONGODB_URL || 'mongodb://localhost:27017/investment',
  isMongoDBAvailable: false
}

// MongoDB Atlas configuration (cloud option)
const mongoDBAtlasConfig: DatabaseConfig = {
  type: 'mongodb',
  url: process.env.MONGODB_ATLAS_URL || 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/investment?retryWrites=true&w=majority',
  isMongoDBAvailable: false
}

// Function to test MongoDB connection
export async function testMongoDBConnection(url: string): Promise<boolean> {
  try {
    // This would require the MongoDB driver
    // For now, return false since we don't have MongoDB available
    console.log('Testing MongoDB connection to:', url.replace(/\/\/.*@/, '//***:***@'))
    return false
  } catch (error) {
    console.error('MongoDB connection test failed:', error)
    return false
  }
}

// Function to get the best available database configuration
export function getDatabaseConfig(): DatabaseConfig {
  // Check if MongoDB URL is available and test connection
  if (process.env.MONGODB_URL || process.env.MONGODB_ATLAS_URL) {
    const mongoUrl = process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URL!
    if (testMongoDBConnection(mongoUrl)) {
      return {
        type: 'mongodb',
        url: mongoUrl,
        isMongoDBAvailable: true
      }
    }
  }
  
  // Fall back to SQLite
  return currentConfig
}

// Function to create a MongoDB-ready schema
export function getMongoDBSchema(): string {
  return `
  // MongoDB-compatible schema
  // To use this schema:
  // 1. Change provider to "mongodb" in prisma/schema.prisma
  // 2. Add @map("_id") to all id fields
  // 3. Remove referential actions from relations
  // 4. Update DATABASE_URL to MongoDB connection string
  
  datasource db {
    provider = "mongodb"
    url      = env("DATABASE_URL")
  }
  
  // All models would have @map("_id") on id fields
  // Relations would not have onDelete/onUpdate actions
  `
}

// Export current configuration
export default currentConfig

// Instructions for MongoDB migration
export const MIGRATION_INSTRUCTIONS = `
MongoDB Migration Instructions:

1. Install and start MongoDB:
   - Local: sudo systemctl start mongod
   - Docker: docker run -d -p 27017:27017 --name mongodb mongo
   - Cloud: Sign up for MongoDB Atlas

2. Update environment variables:
   - For local: DATABASE_URL="mongodb://localhost:27017/investment"
   - For Atlas: DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/investment?retryWrites=true&w=majority"

3. Update Prisma schema:
   - Change provider to "mongodb"
   - Add @map("_id") to all id fields
   - Remove referential actions from relations

4. Regenerate and push:
   - npx prisma generate
   - npx prisma db push

5. Update application code:
   - Remove any SQLite-specific queries
   - Update any operations that rely on foreign keys

Current Status: Using SQLite (MongoDB not available)
`