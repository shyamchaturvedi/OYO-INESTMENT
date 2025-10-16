'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalInvestments: number
  totalRevenue: number
  pendingWithdrawals: number
  pendingFundRequests: number
  todayTransactions: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInvestments: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingFundRequests: 0,
    todayTransactions: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual stats from API
    const mockStats: DashboardStats = {
      totalUsers: 1250,
      activeUsers: 890,
      totalInvestments: 2500000,
      totalRevenue: 187500,
      pendingWithdrawals: 12,
      pendingFundRequests: 8,
      todayTransactions: 45,
      monthlyRevenue: 45000,
    }
    
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: '+8%',
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Total Investments',
      value: `₹${stats.totalInvestments.toLocaleString()}`,
      change: '+15%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+22%',
      changeType: 'increase' as const,
      icon: CreditCard,
      color: 'text-orange-600',
    },
  ]

  const activityCards = [
    {
      title: 'Pending Withdrawals',
      value: stats.pendingWithdrawals,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Pending Fund Requests',
      value: stats.pendingFundRequests,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Today\'s Transactions',
      value: stats.todayTransactions,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the PowerOYO Admin Dashboard</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                {stat.changeType === 'increase' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activityCards.map((activity, index) => (
          <Card key={index} className={activity.bgColor}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {activity.title}
              </CardTitle>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activity.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900">Review Withdrawals</h3>
              <p className="text-sm text-gray-600 mt-1">
                {stats.pendingWithdrawals} pending requests
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900">Review Fund Requests</h3>
              <p className="text-sm text-gray-600 mt-1">
                {stats.pendingFundRequests} pending requests
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-900">Manage Plans</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update investment plans
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}