'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Server,
  Cloud,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react'

interface DatabaseStatus {
  current: {
    type: string
    provider: string
    url: string
    features: string[]
  }
  connection: {
    provider: string
    url: string
    connected: boolean
    migrationReady: boolean
    error?: string
  }
  mongoDB: {
    available: boolean
    configured: boolean
  }
  migration: {
    ready: boolean
    steps: string[]
  }
  timestamp: string
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/db-status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch database status:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setLoading(true)
    fetchStatus()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading database status...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load database status</p>
          <Button onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Database Status</h1>
                <p className="text-sm text-gray-600">PowerOYO Investment Platform</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="w-5 h-5 mr-2 text-blue-600" />
                Current Database
              </CardTitle>
              <CardDescription>
                Active database configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="secondary">{status.current.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Provider</span>
                  <Badge variant="outline">{status.current.provider}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">URL</span>
                  <span className="text-sm text-gray-600 font-mono">{status.current.url}</span>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Features</h4>
                  <div className="space-y-1">
                    {status.current.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {status.connection.connected ? (
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                )}
                Connection Status
              </CardTitle>
              <CardDescription>
                Database connection health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={status.connection.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {status.connection.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Migration Ready</span>
                  <Badge className={status.connection.migrationReady ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                    {status.connection.migrationReady ? 'Ready' : 'Not Ready'}
                  </Badge>
                </div>
                {status.connection.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Error</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{status.connection.error}</p>
                  </div>
                )}
                <Separator />
                <div className="text-xs text-gray-500">
                  Last checked: {new Date(status.timestamp).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MongoDB Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="w-5 h-5 mr-2 text-purple-600" />
                MongoDB Status
              </CardTitle>
              <CardDescription>
                MongoDB availability and configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available</span>
                  <Badge className={status.mongoDB.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {status.mongoDB.available ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Configured</span>
                  <Badge className={status.mongoDB.configured ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
                    {status.mongoDB.configured ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>
                <Separator />
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center text-yellow-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Migration Required</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    MongoDB is not currently available. See migration guide for setup instructions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Migration Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-orange-600" />
                Migration Steps
              </CardTitle>
              <CardDescription>
                Steps to migrate to MongoDB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {status.migration.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{step}</p>
                  </div>
                ))}
              </div>
              <Separator className="mt-4" />
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Migration Guide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
              <CardDescription>
                Additional details about database configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Current Setup</h4>
                  <p className="text-sm text-gray-600">
                    The application is currently using SQLite for data storage. This provides a reliable, 
                    file-based database that requires no additional setup.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">MongoDB Benefits</h4>
                  <p className="text-sm text-gray-600">
                    MongoDB offers better scalability, performance for large datasets, and cloud hosting 
                    options through MongoDB Atlas.
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Migration Status</h4>
                  <p className="text-sm text-gray-600">
                    The application is ready for migration when MongoDB becomes available. 
                    All necessary configurations and code updates are prepared.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}