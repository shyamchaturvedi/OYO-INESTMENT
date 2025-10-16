# MongoDB Migration Guide

This document provides step-by-step instructions for migrating the PowerOYO investment platform from SQLite to MongoDB.

## Current Status

✅ **Database**: SQLite (file:./dev.db)  
✅ **Connection**: Working  
✅ **Migration Ready**: Yes  
❌ **MongoDB**: Not available  

## Why Migrate to MongoDB?

- **Better Performance**: NoSQL database optimized for read-heavy operations
- **Scalability**: Horizontal scaling capabilities
- **Flexibility**: Document-based storage for complex data structures
- **Cloud Hosting**: Easy deployment on MongoDB Atlas
- **Real-time Features**: Better support for real-time applications

## Migration Steps

### 1. Set Up MongoDB

#### Option A: Local MongoDB Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

#### Option B: MongoDB Atlas (Cloud)
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Whitelist your IP address

### 2. Update Environment Variables

Update your `.env` file:

```env
# For local MongoDB
DATABASE_URL="mongodb://localhost:27017/investment"

# For MongoDB Atlas
DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/investment?retryWrites=true&w=majority"
```

### 3. Update Prisma Schema

1. Change the provider in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

2. Add `@map("_id")` to all model IDs:
```prisma
model User {
  id String @id @default(cuid()) @map("_id")
  // ... other fields
}
```

3. Remove referential actions from relations:
```prisma
// Before
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

// After (MongoDB)
user User @relation(fields: [userId], references: [id])
```

### 4. Regenerate and Push

```bash
npx prisma generate
npx prisma db push
```

### 5. Data Migration (Optional)

If you need to migrate existing data:

1. Export data from SQLite
2. Transform data for MongoDB format
3. Import into MongoDB

### 6. Update Application Code

Some code changes may be needed:

- Remove SQLite-specific queries
- Update aggregation operations
- Test all database operations

## MongoDB Schema Differences

### Foreign Keys
MongoDB doesn't enforce foreign key constraints. You'll need to handle data integrity in your application code.

### Aggregations
MongoDB uses powerful aggregation pipelines instead of SQL joins:

```javascript
// SQLite
const userWithInvestments = await db.user.findMany({
  include: { investments: true }
})

// MongoDB equivalent
const userWithInvestments = await db.user.aggregate([
  {
    $lookup: {
      from: "investments",
      localField: "_id",
      foreignField: "userId",
      as: "investments"
    }
  }
])
```

### Data Types
MongoDB supports additional data types:
- Arrays
- Nested objects
- Dates
- ObjectIds

## Testing the Migration

1. Test all API endpoints
2. Verify data integrity
3. Check performance
4. Test authentication and authorization
5. Verify investment calculations

## Rolling Back

If you need to roll back to SQLite:

1. Update `.env` to use SQLite URL
2. Change provider back to "sqlite" in schema
3. Remove `@map("_id")` annotations
4. Add back referential actions
5. Regenerate and push

## Performance Optimizations

### Indexes
Create indexes for better query performance:

```javascript
// In Prisma schema
model User {
  id String @id @default(cuid()) @map("_id")
  email String @unique
  referralCode String @unique
  // Add indexes
  @@index([email])
  @@index([referralCode])
}
```

### Connection Pooling
Configure connection pooling for production:

```env
DATABASE_URL="mongodb://localhost:27017/investment?retryWrites=true&w=majority&maxPoolSize=10"
```

## Monitoring

Monitor your MongoDB instance:

- Connection count
- Query performance
- Memory usage
- Disk space

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Check network connectivity and firewall settings
2. **Authentication Error**: Verify username/password and database permissions
3. **Schema Validation**: Ensure all required fields are present
4. **Performance Issues**: Add appropriate indexes

### Debug Mode

Enable debug logging:

```env
DEBUG="prisma:engine"
```

## Support

- [Prisma MongoDB Documentation](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Support](https://docs.atlas.mongodb.com/)

## Current Database Status

You can check the current database status by visiting:
`GET /api/db-status`

This will show you:
- Current database provider
- Connection status
- MongoDB availability
- Migration readiness

---

**Note**: This migration guide is prepared for when MongoDB becomes available. The application currently runs on SQLite and is fully functional.