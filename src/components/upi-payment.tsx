'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  QrCode, 
  Copy, 
  CheckCircle,
  Upload,
  ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'

interface UPIPaymentMethod {
  id: string
  upiId: string
  displayName: string
  qrCode: string
  isDefault: boolean
}

interface UPIPaymentProps {
  amount: number
  onSuccess?: () => void
  onCancel?: () => void
}

export default function UPIPayment({ amount, onSuccess, onCancel }: UPIPaymentProps) {
  const [upiMethods, setUpiMethods] = useState<UPIPaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<UPIPaymentMethod | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState<'select' | 'payment' | 'confirmation'>('select')

  useEffect(() => {
    fetchUPIMethods()
  }, [])

  const fetchUPIMethods = async () => {
    try {
      // TODO: Replace with actual API call
      const mockUPIMethods: UPIPaymentMethod[] = [
        {
          id: '1',
          upiId: 'poweroyo@ybl',
          displayName: 'PowerOYO Official',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          isDefault: true,
        },
        {
          id: '2',
          upiId: 'payments@poweroyo',
          displayName: 'PowerOYO Payments',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          isDefault: false,
        },
      ]
      
      setUpiMethods(mockUPIMethods)
      const defaultMethod = mockUPIMethods.find(m => m.isDefault)
      if (defaultMethod) {
        setSelectedMethod(defaultMethod)
      }
      setLoading(false)
    } catch (error) {
      toast.error('Failed to load UPI payment methods')
      setLoading(false)
    }
  }

  const copyUPIId = (upiId: string) => {
    navigator.clipboard.writeText(upiId)
    toast.success('UPI ID copied to clipboard')
  }

  const handleMethodSelect = (method: UPIPaymentMethod) => {
    setSelectedMethod(method)
    setStep('payment')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setScreenshot(file)
    }
  }

  const handleSubmitPayment = async () => {
    if (!selectedMethod || !transactionId || !screenshot) {
      toast.error('Please fill all required fields')
      return
    }

    setProcessing(true)
    try {
      // TODO: Replace with actual API call
      const formData = new FormData()
      formData.append('amount', amount.toString())
      formData.append('method', 'UPI')
      formData.append('transactionId', transactionId)
      formData.append('screenshot', screenshot)
      formData.append('upiId', selectedMethod.upiId)

      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Payment request submitted successfully')
      setStep('confirmation')
    } catch (error) {
      toast.error('Failed to submit payment request')
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setTransactionId('')
    setScreenshot(null)
    setStep('select')
    setSelectedMethod(upiMethods.find(m => m.isDefault) || null)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>UPI Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          UPI Payment - ₹{amount.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Select UPI Payment Method</h3>
              <div className="space-y-3">
                {upiMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod?.id === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleMethodSelect(method)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{method.displayName}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          {method.upiId}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyUPIId(method.upiId)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && selectedMethod && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Payment Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Paying to:</span>
                  <span className="font-medium">{selectedMethod.displayName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">UPI ID:</span>
                  <div className="flex items-center">
                    <span className="font-mono">{selectedMethod.upiId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                      onClick={() => copyUPIId(selectedMethod.upiId)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-bold text-lg">₹{amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Scan QR Code</h4>
              <div className="flex justify-center">
                <div className="p-4 bg-white border rounded-lg">
                  <img
                    src={selectedMethod.qrCode}
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Payment Confirmation</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your UPI transaction ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="screenshot">Payment Screenshot *</Label>
                  <div className="mt-2">
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('screenshot')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {screenshot ? screenshot.name : 'Upload Payment Screenshot'}
                    </Button>
                  </div>
                  {screenshot && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(screenshot)}
                        alt="Payment Screenshot"
                        className="max-w-full h-32 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmitPayment}
                disabled={processing || !transactionId || !screenshot}
                className="flex-1"
              >
                {processing ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-medium text-green-600">Payment Submitted!</h3>
              <p className="text-gray-600 mt-2">
                Your payment request of ₹{amount.toLocaleString()} has been submitted successfully.
                We will verify your payment and credit your account shortly.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <div>Transaction ID: <span className="font-mono">{transactionId}</span></div>
                <div>Amount: <span className="font-medium">₹{amount.toLocaleString()}</span></div>
                <div>Status: <span className="text-yellow-600">Pending Verification</span></div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1"
              >
                Make Another Payment
              </Button>
              <Button
                onClick={onSuccess}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}