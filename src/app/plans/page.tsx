'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import { 
  TrendingUp, 
  Gift, 
  Calendar,
  IndianRupee,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Wallet,
  Percent,
  Shield,
  Users
} from 'lucide-react'

interface InvestmentPlan {
  id: string
  name: string
  amount: number
  dailyROI: number
  duration: number
  description: string
  status: string
}

export default function PlansPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [investing, setInvesting] = useState<string | null>(null)

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchPlans()
  }, [user, router])

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const plansData = await response.json()
        setPlans(plansData)
      } else {
        setMessage({ type: 'error', text: 'Failed to load investment plans' })
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInvest = async (planId: string, planAmount: number) => {
    setInvesting(planId)
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Investment successful! ROI will start crediting daily.' })
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Investment failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setInvesting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading investment plans...</p>
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
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-red-600">Investment Plans</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Message */}
        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              {/* Popular Badge */}
              {plan.name === 'Standard Plan' && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-red-600 text-white">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Investment Amount */}
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Investment Amount</p>
                  <p className="text-3xl font-bold text-red-600">
                    <IndianRupee className="w-6 h-6 inline mr-1" />
                    {plan.amount}
                  </p>
                </div>

                {/* ROI Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Percent className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm">Daily ROI</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      <IndianRupee className="w-3 h-3 inline" />
                      {plan.dailyROI}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {plan.duration} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Gift className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm">Total Returns</span>
                    </div>
                    <span className="font-semibold text-purple-600">
                      <IndianRupee className="w-3 h-3 inline" />
                      {plan.dailyROI * plan.duration}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Daily automatic ROI credit
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {((plan.dailyROI * plan.duration) / plan.amount * 100).toFixed(0)}% total returns
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Secure investment
                  </div>
                </div>

                {/* Invest Button */}
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => handleInvest(plan.id, plan.amount)}
                  disabled={investing === plan.id}
                >
                  {investing === plan.id ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Invest Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                Daily Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get daily returns automatically credited to your wallet. No manual withdrawal required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Secure Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your investments are secure with our advanced security measures and transparent system.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-red-600" />
                Referral Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Earn additional income through our 5-level referral system when your friends invest.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}