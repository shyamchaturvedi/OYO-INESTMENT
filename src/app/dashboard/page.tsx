'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  Gift, 
  History, 
  Settings,
  LogOut,
  Copy,
  Share2,
  Phone,
  Mail,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface DashboardData {
  user: {
    id: string
    fullName: string
    email: string
    mobile: string
    referralCode: string
    walletBalance: number
    totalEarnings: number
    kycStatus: string
  }
  stats: {
    activeInvestments: number
    todayROI: number
    totalReferrals: number
    levelIncome: number
  }
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    createdAt: string
    status: string
  }>
  investments: Array<{
    id: string
    planName: string
    amount: number
    dailyROI: number
    remainingDays: number
    totalEarned: number
    status: string
  }>
}

export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Redirect if user is not authenticated
  useEffect(() => {
    console.log('Dashboard auth check:', { user: !!user, loading, userRole: user?.role })
    
    if (!user && !loading) {
      console.log('No user found and not loading, redirecting to home')
      router.push('/')
      return
    }
    if (user) {
      console.log('User found, fetching dashboard data')
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid, logout and redirect
        await logout()
      } else {
        // Show error state instead of mock data
        console.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${data?.user.referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = async () => {
    const referralLink = `${window.location.origin}/register?ref=${data?.user.referralCode}`
    const text = `Join PowerOYO and start earning daily returns! Use my referral code: ${data?.user.referralCode}\n\nRegister here: ${referralLink}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join PowerOYO',
          text: text,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold text-red-600">PowerOYO</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold">{data.user.fullName}</p>
              </div>
              
              <div className="relative">
                <div className={`w-3 h-3 rounded-full absolute -top-1 -right-1 ${
                  data.user.kycStatus === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              
              {/* Admin Button - Show only for admin users */}
              {data.user.role && data.user.role === 'ADMIN' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/admin')}
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Wallet Balance</p>
                  <p className="text-3xl font-bold mt-2">
                    <IndianRupee className="w-6 h-6 inline mr-1" />
                    {data.user.walletBalance.toLocaleString()}
                  </p>
                </div>
                <Wallet className="w-10 h-10 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Earnings</p>
                  <p className="text-3xl font-bold mt-2">
                    <IndianRupee className="w-6 h-6 inline mr-1" />
                    {data.user.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Investments</p>
                  <p className="text-3xl font-bold mt-2">{data.stats.activeInvestments}</p>
                </div>
                <Gift className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Referrals</p>
                  <p className="text-3xl font-bold mt-2">{data.stats.totalReferrals}</p>
                </div>
                <Users className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-600" />
                  Today's Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Daily ROI</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      <IndianRupee className="w-4 h-4 inline" />
                      {data.stats.todayROI}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Level Income</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      <IndianRupee className="w-4 h-4 inline" />
                      {data.stats.levelIncome}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Investments */}
            <Card>
              <CardHeader>
                <CardTitle>Active Investments</CardTitle>
                <CardDescription>Your current investment plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.investments.map((investment) => (
                    <div key={investment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{investment.planName}</h4>
                          <p className="text-sm text-gray-600">
                            Daily Return: <IndianRupee className="w-3 h-3 inline" />
                            {investment.dailyROI}
                          </p>
                        </div>
                        <Badge className={investment.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {investment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{30 - investment.remainingDays}/30 days</span>
                        </div>
                        <Progress value={((30 - investment.remainingDays) / 30) * 100} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>Total Earned</span>
                          <span className="font-semibold text-green-600">
                            <IndianRupee className="w-3 h-3 inline" />
                            {investment.totalEarned}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  onClick={() => router.push('/plans')}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  View All Plans
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <History className="w-5 h-5 mr-2 text-red-600" />
                    Recent Transactions
                  </span>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'ROI' ? 'bg-green-100' :
                          transaction.type === 'REFERRAL' ? 'bg-purple-100' :
                          transaction.type === 'INVESTMENT' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {transaction.type === 'ROI' ? <ArrowDownRight className="w-5 h-5 text-green-600" /> :
                           transaction.type === 'REFERRAL' ? <Gift className="w-5 h-5 text-purple-600" /> :
                           transaction.type === 'INVESTMENT' ? <ArrowUpRight className="w-5 h-5 text-red-600" /> :
                           <History className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'INVESTMENT' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'INVESTMENT' ? '-' : '+'}
                          <IndianRupee className="w-4 h-4 inline" />
                          {transaction.amount}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Referral Card */}
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Refer & Earn</CardTitle>
                <CardDescription className="text-red-100">
                  Invite friends and earn 5-level commission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-red-100 mb-2">Your Referral Code</p>
                    <div className="bg-white/20 rounded-lg p-3 font-mono text-lg font-bold">
                      {data.user.referralCode}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      className="flex-1 bg-white text-red-600 hover:bg-gray-100"
                      onClick={copyReferralLink}
                    >
                      {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex-1 bg-white text-red-600 hover:bg-gray-100"
                      onClick={shareReferral}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="text-sm text-red-100">
                    <p className="font-semibold mb-2">Commission Levels:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Level 1:</span>
                        <span>10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 2:</span>
                        <span>5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 3:</span>
                        <span>3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 4:</span>
                        <span>2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level 5:</span>
                        <span>1%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KYC Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-red-600" />
                  KYC Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    data.user.kycStatus === 'APPROVED' ? 'bg-green-100' :
                    data.user.kycStatus === 'PENDING' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    {data.user.kycStatus === 'APPROVED' ? <CheckCircle className="w-8 h-8 text-green-600" /> :
                     data.user.kycStatus === 'PENDING' ? <Clock className="w-8 h-8 text-yellow-600" /> :
                     <AlertCircle className="w-8 h-8 text-red-600" />}
                  </div>
                  
                  <Badge className={
                    data.user.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    data.user.kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {data.user.kycStatus}
                  </Badge>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {data.user.kycStatus === 'APPROVED' ? 'Your KYC is verified' :
                     data.user.kycStatus === 'PENDING' ? 'KYC verification in progress' :
                     'Complete your KYC to withdraw funds'}
                  </p>
                  
                  {data.user.kycStatus !== 'APPROVED' && (
                    <Button 
                      className="w-full mt-4 bg-red-600 hover:bg-red-700"
                      onClick={() => router.push('/kyc')}
                    >
                      Complete KYC
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/add-funds')}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/wallet')}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    My Team
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}