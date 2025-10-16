// MongoDB Atlas connection helper
export function getMongoDBAtlasInstructions(): string {
  return `
MongoDB Atlas Connection Setup Instructions:

1. Go to your MongoDB Atlas dashboard (https://cloud.mongodb.com)
2. Select your cluster (Cluster0)
3. Click "Connect" button
4. Choose "Drivers" as connection method
5. Copy the connection string
6. Replace <password> with your actual password: VMCpvAMdUyRSQf12
7. Update the MONGODB_ATLAS_URL in your .env file

Example format:
mongodb+srv://iammshyam_db_user:VMCpvAMdUyRSQf12@cluster0.your-actual-cluster-id.mongodb.net/investment?retryWrites=true&w=majority

Important:
- Replace 'your-actual-cluster-id' with your real cluster ID from Atlas
- Keep the database name as 'investment'
- Ensure your IP address is whitelisted in Atlas Network Access
- Ensure your database user has read/write permissions
`
}

export function validateMongoDBAtlasURL(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: false, error: 'URL is required' }
  }

  try {
    const urlObj = new URL(url)
    
    if (urlObj.protocol !== 'mongodb+srv:') {
      return { valid: false, error: 'Protocol must be mongodb+srv:' }
    }

    if (!urlObj.username) {
      return { valid: false, error: 'Username is required' }
    }

    if (!urlObj.password) {
      return { valid: false, error: 'Password is required' }
    }

    if (!urlObj.hostname) {
      return { valid: false, error: 'Hostname is required' }
    }

    if (urlObj.hostname.includes('xxxxx') || urlObj.hostname.includes('abcde')) {
      return { valid: false, error: 'Please replace placeholder cluster ID with your actual cluster ID' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' }
  }
}

export function getCurrentMongoDBStatus(): {
  configured: boolean
  url: string | null
  validation: { valid: boolean; error?: string } | null
} {
  const url = process.env.MONGODB_ATLAS_URL || null
  
  return {
    configured: !!url,
    url: url ? url.replace(/\/\/.*@/, '//***:***@') : null,
    validation: url ? validateMongoDBAtlasURL(url) : null
  }
}