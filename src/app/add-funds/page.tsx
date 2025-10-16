'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  ArrowUpFromDot,
  TrendingUp,
  Wallet,
  Smartphone
} from 'lucide-react'
import UPIPayment from '@/components/upi-payment'
import { toast } from 'sonner'

const predefinedAmounts = [100, 200, 500, 1000, 2000, 5000]

export default function AddFundsPage() {
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<string>('upi')
  const [showPayment, setShowPayment] = useState(false)

  const handleAmountSelect = (value: string) => {
    setAmount(value)
  }

  const handleAddFunds = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (parseFloat(amount) < 50) {
      toast.error('Minimum amount is ₹50')
      return
    }

    if (parseFloat(amount) > 50000) {
      toast.error('Maximum amount is ₹50,000')
      return
    }

    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    toast.success('Funds added successfully!')
    setShowPayment(false)
    setAmount('')
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  if (showPayment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <UPIPayment
            amount={parseFloat(amount)}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
          <p className="text-gray-600">Add funds to your investment account</p>
        </div>

        {/* Account Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₹1,250.75
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Available for investment
            </p>
          </CardContent>
        </Card>

        {/* Add Funds Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add Funds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="amount">Enter Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="50"
                max="50000"
              />
              <p className="text-sm text-gray-600 mt-1">
                Minimum: ₹50 | Maximum: ₹50,000
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Quick Amounts</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                {predefinedAmounts.map((value) => (
                  <Button
                    key={value}
                    variant={amount === value.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAmountSelect(value.toString())}
                  >
                    ₹{value}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      UPI Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="bank" disabled>
                    <div className="flex items-center">
                      <ArrowUpFromDot className="h-4 w-4 mr-2" />
                      Bank Transfer (Coming Soon)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount to be added:</span>
                  <span className="text-xl font-bold">₹{parseFloat(amount).toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleAddFunds}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full"
              size="lg"
            >
              <ArrowUpFromDot className="h-4 w-4 mr-2" />
              Proceed to Payment
            </Button>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Why Add Funds?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Daily Returns</h4>
                  <p className="text-sm text-gray-600">
                    Earn up to 28% daily returns on your investments
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Wallet className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Instant Withdrawals</h4>
                  <p className="text-sm text-gray-600">
                    Withdraw your earnings anytime, anywhere
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Plus className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Multiple Plans</h4>
                  <p className="text-sm text-gray-600">
                    Choose from various investment plans starting at ₹50
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <ArrowUpFromDot className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium">Secure Payments</h4>
                  <p className="text-sm text-gray-600">
                    All payments are secured and encrypted
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Fund Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">₹1,000</div>
                  <div className="text-sm text-gray-600">UPI Payment</div>
                </div>
                <Badge variant="default">Approved</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">₹500</div>
                  <div className="text-sm text-gray-600">UPI Payment</div>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}