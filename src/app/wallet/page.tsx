'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Minus,
  IndianRupee,
  Copy,
  CheckCircle,
  AlertCircle,
  History,
  TrendingUp,
  Clock,
  XCircle
} from 'lucide-react'

export default function WalletPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [addAmount, setAddAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [transactions, setTransactions] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [bankDetails, setBankDetails] = useState('')

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchWalletData()
    fetchWithdrawalHistory()
  }, [user, router])

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/withdrawal', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal history:', error)
    }
  }

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBalance(data.user.walletBalance)
        setTransactions(data.recentTransactions || [])
      } else {
        setMessage({ type: 'error', text: 'Failed to load wallet data' })
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    }
  }

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (!addAmount || parseFloat(addAmount) < 50) {
      setMessage({ type: 'error', text: 'Minimum add amount is ₹50' })
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/fund-request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(addAmount),
          method: 'UPI',
          transactionId: `MANUAL_${Date.now()}`,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: 'Add funds request submitted! Admin will approve after payment verification.' })
        setAddAmount('')
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to submit add funds request' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    if (!withdrawAmount || parseFloat(withdrawAmount) < 100) {
      setMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹100' })
      setLoading(false)
      return
    }

    if (parseFloat(withdrawAmount) > balance) {
      setMessage({ type: 'error', text: 'Insufficient balance' })
      setLoading(false)
      return
    }

    if (!upiId && !bankDetails) {
      setMessage({ type: 'error', text: 'Please provide UPI ID or bank details' })
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          method: upiId ? 'UPI' : 'BANK_TRANSFER',
          details: upiId || bankDetails,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: data.message })
        setWithdrawAmount('')
        setUpiId('')
        setBankDetails('')
        fetchWithdrawalHistory()
        fetchWalletData() // Refresh balance
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to process withdrawal' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process withdrawal. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const copyUPI = () => {
    const upiId = 'poweroyo@ybl'
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              <h1 className="text-2xl font-bold text-red-600">My Wallet</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-lg mb-2">Available Balance</p>
                <p className="text-5xl font-bold">
                  <IndianRupee className="w-10 h-10 inline mr-2" />
                  {balance.toLocaleString()}
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Message */}
        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add Funds</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
              </TabsList>
              
              <TabsContent value="add">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-green-600" />
                      Add Funds to Wallet
                    </CardTitle>
                    <CardDescription>
                      Add funds to your wallet to invest in plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddFunds} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="addAmount">Amount (₹)</Label>
                        <Input
                          id="addAmount"
                          type="number"
                          placeholder="Enter amount (min ₹50)"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          min="50"
                          step="10"
                          required
                        />
                      </div>

                      {/* Payment Info */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          <div className="flex items-center justify-between">
                            <span>UPI ID:</span>
                            <div className="flex items-center space-x-2">
                              <code className="bg-white px-2 py-1 rounded">poweroyo@ybl</code>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyUPI}
                              >
                                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                          <p>Pay the amount to the UPI ID above and submit the request</p>
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? 'Processing...' : 'Submit Add Funds Request'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="withdraw">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Minus className="w-5 h-5 mr-2 text-red-600" />
                      Withdraw Funds
                    </CardTitle>
                    <CardDescription>
                      Withdraw funds from your wallet to your bank account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWithdraw} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawAmount">Amount (₹)</Label>
                        <Input
                          id="withdrawAmount"
                          type="number"
                          placeholder="Enter amount (min ₹100)"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          min="100"
                          max={balance}
                          step="10"
                          required
                        />
                        <p className="text-sm text-gray-600">
                          Available balance: ₹{balance.toLocaleString()}
                        </p>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-4">
                        <Label>Payment Details</Label>
                        <Tabs defaultValue="upi" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upi">UPI</TabsTrigger>
                            <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="upi">
                            <div className="space-y-2">
                              <Label htmlFor="upiId">UPI ID</Label>
                              <Input
                                id="upiId"
                                type="text"
                                placeholder="Enter your UPI ID (e.g., user@ybl)"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                              />
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="bank">
                            <div className="space-y-2">
                              <Label htmlFor="bankDetails">Bank Details</Label>
                              <Textarea
                                id="bankDetails"
                                placeholder="Enter your bank details&#10;Account Number:&#10;IFSC Code:&#10;Account Holder Name:&#10;Bank Name:"
                                value={bankDetails}
                                onChange={(e) => setBankDetails(e.target.value)}
                                rows={4}
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Withdrawal Info */}
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2">Withdrawal Information</h4>
                        <div className="space-y-2 text-sm text-yellow-800">
                          <p>• Minimum withdrawal: ₹100</p>
                          <p>• Processing time: 24-48 hours</p>
                          <p>• KYC verification required</p>
                          <p>• Admin approval required</p>
                          <p>• Funds will be deducted after admin approval</p>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700" 
                        disabled={loading || balance < 100}
                      >
                        {loading ? 'Processing...' : 'Submit Withdrawal Request'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Earnings</span>
                    <span className="font-semibold text-green-600">+₹45</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-green-600">+₹8,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Investments</span>
                    <span className="font-semibold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2 text-red-600" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'ROI' ? 'bg-green-100' :
                          transaction.type === 'REFERRAL' ? 'bg-purple-100' :
                          transaction.type === 'ADD_FUNDS' ? 'bg-blue-100' :
                          transaction.type === 'WITHDRAWAL' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {transaction.type === 'ROI' ? <ArrowDownRight className="w-4 h-4 text-green-600" /> :
                           transaction.type === 'REFERRAL' ? <TrendingUp className="w-4 h-4 text-purple-600" /> :
                           transaction.type === 'ADD_FUNDS' ? <Plus className="w-4 h-4 text-blue-600" /> :
                           transaction.type === 'WITHDRAWAL' ? <Minus className="w-4 h-4 text-red-600" /> :
                           <History className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          transaction.type === 'WITHDRAWAL' || transaction.type === 'INVESTMENT' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'WITHDRAWAL' || transaction.type === 'INVESTMENT' ? '-' : '+'}
                          ₹{transaction.amount}
                        </p>
                        <Badge className={`text-xs ${
                          transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Minus className="w-5 h-5 mr-2 text-red-600" />
                  Withdrawal History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {withdrawals.slice(0, 5).map((withdrawal: any) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          withdrawal.status === 'PENDING' ? 'bg-yellow-100' :
                          withdrawal.status === 'APPROVED' ? 'bg-green-100' :
                          withdrawal.status === 'REJECTED' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {withdrawal.status === 'PENDING' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                           withdrawal.status === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                           withdrawal.status === 'REJECTED' ? <XCircle className="w-4 h-4 text-red-600" /> :
                           <Clock className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Withdrawal - {withdrawal.method}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                          {withdrawal.adminRemark && (
                            <p className="text-xs text-gray-600 mt-1">
                              {withdrawal.adminRemark}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-red-600">
                          -₹{withdrawal.amount.toLocaleString()}
                        </p>
                        <Badge className={`text-xs ${
                          withdrawal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          withdrawal.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          withdrawal.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {withdrawals.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No withdrawal requests found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}