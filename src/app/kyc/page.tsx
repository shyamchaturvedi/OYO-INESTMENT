'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  FileText,
  AlertCircle,
  Loader2,
  Clock,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface KYCFormData {
  aadharFront: File | null
  aadharBack: File | null
  panCard: string
  bankDetails: {
    accountNumber: string
    ifsc: string
    bankName: string
  }
  upiId: string
}

interface KYCStatus {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUBMITTED'
  submittedAt: string
  reviewedAt?: string
  adminRemark?: string
  documents: {
    aadharFront: boolean
    aadharBack: boolean
    panCard: boolean
    bankDetails: boolean
  }
}

export default function KYCPage() {
  const [formData, setFormData] = useState<KYCFormData>({
    aadharFront: null,
    aadharBack: null,
    panCard: '',
    bankDetails: {
      accountNumber: '',
      ifsc: '',
      bankName: ''
    },
    upiId: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null)
  const [isConnected, setIsConnected] = useState(true) // Simulate connection
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { toast } = useToast()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.aadharFront) {
      newErrors.aadharFront = 'Aadhaar front image is required'
    }
    if (!formData.aadharBack) {
      newErrors.aadharBack = 'Aadhaar back image is required'
    }
    if (!formData.panCard) {
      newErrors.panCard = 'PAN card number is required'
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard)) {
      newErrors.panCard = 'Invalid PAN card format'
    }
    if (!formData.bankDetails.accountNumber) {
      newErrors.accountNumber = 'Bank account number is required'
    }
    if (!formData.bankDetails.ifsc) {
      newErrors.ifsc = 'IFSC code is required'
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifsc)) {
      newErrors.ifsc = 'Invalid IFSC code format'
    }
    if (!formData.bankDetails.bankName) {
      newErrors.bankName = 'Bank name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileUpload = (field: 'aadharFront' | 'aadharBack', file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }))
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [field]: 'Please upload an image file' }))
      return
    }

    setFormData(prev => ({ ...prev, [field]: file }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Simulate successful submission
      const mockKYCStatus: KYCStatus = {
        id: 'kyc-' + Date.now(),
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        documents: {
          aadharFront: !!formData.aadharFront,
          aadharBack: !!formData.aadharBack,
          panCard: !!formData.panCard,
          bankDetails: !!formData.bankDetails.accountNumber
        }
      }

      setKycStatus(mockKYCStatus)
      setCurrentStep(4)
      setLastUpdate(new Date())
      
      toast({
        title: 'KYC Submitted Successfully',
        description: 'Your documents are under review. You will be notified of the status.',
      })

      // Simulate status updates
      setTimeout(() => {
        setKycStatus(prev => prev ? { ...prev, status: 'PENDING' } : null)
        setLastUpdate(new Date())
        toast({
          title: 'KYC Under Review',
          description: 'Your KYC is now being reviewed by our team.',
        })
      }, 10000)

    } catch (error) {
      console.error('KYC submission error:', error)
      toast({
        title: 'Submission Failed',
        description: 'Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const getStepProgress = () => {
    return (currentStep / 3) * 100
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'SUBMITTED':
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected'
      case 'PENDING':
        return 'Under Review'
      case 'SUBMITTED':
        return 'Submitted'
      default:
        return 'Unknown'
    }
  }

  const getProgressPercentage = () => {
    if (!kycStatus) return 0
    
    const documentCount = Object.values(kycStatus.documents).filter(Boolean).length
    const totalDocuments = Object.keys(kycStatus.documents).length
    
    return Math.round((documentCount / totalDocuments) * 100)
  }

  const refreshStatus = () => {
    setLastUpdate(new Date())
    toast({
      title: 'Status Refreshed',
      description: 'KYC status has been updated.',
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-600">
          Complete your Know Your Customer verification to access all features
        </p>
      </div>

      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live Updates Active' : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshStatus}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KYC Status Display */}
      {kycStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(kycStatus.status)}
                <span>KYC Status</span>
              </CardTitle>
              <Badge className={getStatusColor(kycStatus.status)}>
                {getStatusText(kycStatus.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Document Completion</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
            </div>

            {/* Document Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${kycStatus.documents.aadharFront ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Aadhaar Front</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${kycStatus.documents.aadharBack ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Aadhaar Back</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${kycStatus.documents.panCard ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">PAN Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${kycStatus.documents.bankDetails ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm">Bank Details</span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Submitted:</span>
                <span>{new Date(kycStatus.submittedAt).toLocaleString()}</span>
              </div>
              {kycStatus.reviewedAt && (
                <div className="flex justify-between">
                  <span>Reviewed:</span>
                  <span>{new Date(kycStatus.reviewedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Status-specific messages */}
            {kycStatus.status === 'PENDING' && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your KYC is currently under review. You will be notified once the review is complete.
                </AlertDescription>
              </Alert>
            )}

            {kycStatus.status === 'APPROVED' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Congratulations! Your KYC has been approved. You can now access all features of the platform.
                </AlertDescription>
              </Alert>
            )}

            {kycStatus.status === 'REJECTED' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Your KYC has been rejected. Please review the admin remark and resubmit with correct documents.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* KYC Form */}
      {!kycStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>KYC Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Step {currentStep} of 3</span>
                  <span>{Math.round(getStepProgress())}% Complete</span>
                </div>
                <Progress value={getStepProgress()} className="h-2" />
              </div>

              {/* Step 1: Document Upload */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Upload Documents</h3>
                  
                  {/* Aadhaar Front */}
                  <div className="space-y-2">
                    <Label htmlFor="aadharFront">Aadhaar Card Front *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        id="aadharFront"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('aadharFront', e.target.files[0])}
                        className="hidden"
                      />
                      <label htmlFor="aadharFront" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          {formData.aadharFront ? formData.aadharFront.name : 'Click to upload Aadhaar front'}
                        </span>
                      </label>
                      {errors.aadharFront && (
                        <p className="text-sm text-red-500 mt-1">{errors.aadharFront}</p>
                      )}
                    </div>
                  </div>

                  {/* Aadhaar Back */}
                  <div className="space-y-2">
                    <Label htmlFor="aadharBack">Aadhaar Card Back *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <input
                        type="file"
                        id="aadharBack"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('aadharBack', e.target.files[0])}
                        className="hidden"
                      />
                      <label htmlFor="aadharBack" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          {formData.aadharBack ? formData.aadharBack.name : 'Click to upload Aadhaar back'}
                        </span>
                      </label>
                      {errors.aadharBack && (
                        <p className="text-sm text-red-500 mt-1">{errors.aadharBack}</p>
                      )}
                    </div>
                  </div>

                  <Button type="button" onClick={nextStep} className="w-full">
                    Next: Personal Details
                  </Button>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Personal Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="panCard">PAN Card Number *</Label>
                    <Input
                      id="panCard"
                      value={formData.panCard}
                      onChange={(e) => setFormData(prev => ({ ...prev, panCard: e.target.value.toUpperCase() }))}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                    {errors.panCard && (
                      <p className="text-sm text-red-500">{errors.panCard}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Bank Account Number *</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankDetails.accountNumber}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                      }))}
                      placeholder="Enter your bank account number"
                    />
                    {errors.accountNumber && (
                      <p className="text-sm text-red-500">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifsc">IFSC Code *</Label>
                    <Input
                      id="ifsc"
                      value={formData.bankDetails.ifsc}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        bankDetails: { ...prev.bankDetails, ifsc: e.target.value.toUpperCase() }
                      }))}
                      placeholder="SBIN0001234"
                      maxLength={11}
                    />
                    {errors.ifsc && (
                      <p className="text-sm text-red-500">{errors.ifsc}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankDetails.bankName}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                      }))}
                      placeholder="Enter your bank name"
                    />
                    {errors.bankName && (
                      <p className="text-sm text-red-500">{errors.bankName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID (Optional)</Label>
                    <Input
                      id="upiId"
                      value={formData.upiId}
                      onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                      placeholder="yourname@paytm"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                      Previous
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1">
                      Next: Review
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Review & Submit</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Aadhaar Front</Label>
                        <p className="text-sm text-gray-600">
                          {formData.aadharFront ? formData.aadharFront.name : 'Not uploaded'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Aadhaar Back</Label>
                        <p className="text-sm text-gray-600">
                          {formData.aadharBack ? formData.aadharBack.name : 'Not uploaded'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">PAN Card</Label>
                      <p className="text-sm text-gray-600">{formData.panCard || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Bank Details</Label>
                      <p className="text-sm text-gray-600">
                        {formData.bankDetails.accountNumber} - {formData.bankDetails.bankName}
                      </p>
                      <p className="text-sm text-gray-600">IFSC: {formData.bankDetails.ifsc}</p>
                    </div>
                    
                    {formData.upiId && (
                      <div>
                        <Label className="text-sm font-medium">UPI ID</Label>
                        <p className="text-sm text-gray-600">{formData.upiId}</p>
                      </div>
                    )}
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please review all information carefully. Once submitted, you cannot modify the details.
                    </AlertDescription>
                  </Alert>

                  <div className="flex space-x-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                      Previous
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit KYC'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Success */}
              {currentStep === 4 && (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-lg font-medium text-green-800">KYC Submitted Successfully!</h3>
                  <p className="text-gray-600">
                    Your KYC documents have been submitted and are under review. 
                    You will be notified of the status via email and in-app notifications.
                  </p>
                  <Button onClick={() => window.location.reload()} className="w-full">
                    Submit Another KYC
                  </Button>
                </div>
              )}
            </form>

            {/* Upload Progress */}
            {isSubmitting && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading documents...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}