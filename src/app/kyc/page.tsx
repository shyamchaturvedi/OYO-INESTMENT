'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import KYCForm from '@/components/kyc/KYCForm'
import KYCStatus from '@/components/kyc/KYCStatus'
import { FileText, AlertTriangle, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { KYCStatus as KYCStatusType } from '@prisma/client'

interface KYCData {
  id: string
  status: KYCStatusType
  aadharNumber?: string
  panNumber?: string
  nomineeName?: string
  nomineeRelation?: string
  submittedAt: string
  reviewedAt?: string
  adminRemark?: string
}

interface UserData {
  totalWithdrawn: number
  kycStatus: KYCStatusType
}

export default function KYCPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [kycData, setKycData] = useState<KYCData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchKYCData()
  }, [])

  const fetchKYCData = async () => {
    try {
      const response = await fetch('/api/kyc/status')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.userData)
        setKycData(data.kycData)
      } else {
        toast.error('Failed to load KYC data')
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error)
      toast.error('Failed to load KYC data')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const needsKYC = userData && userData.totalWithdrawn >= 500
  const canSubmitNewKYC = !kycData || kycData.status === 'REJECTED'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
            <p className="text-gray-600 mt-1">
              Complete your KYC verification as per RBI guidelines
            </p>
          </div>
          <Button variant="outline" onClick={handleGoToDashboard}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Important Notice */}
        {needsKYC && userData?.kycStatus !== 'APPROVED' && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Action Required:</strong> You have reached the ₹500 withdrawal limit. 
              Complete KYC verification to continue withdrawing funds.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KYC Status Card */}
          <div className="lg:col-span-1">
            {userData && (
              <KYCStatus
                kycStatus={userData.kycStatus}
                totalWithdrawn={userData.totalWithdrawn}
                onGoToKYC={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
              />
            )}

            {/* Additional Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Why KYC is Required?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">RBI Compliance</p>
                    <p className="text-gray-600">Mandatory for financial transactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Secure Transactions</p>
                    <p className="text-gray-600">Prevents fraud and money laundering</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Higher Limits</p>
                    <p className="text-gray-600">Unlimited withdrawals after verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {canSubmitNewKYC ? (
              <Tabs defaultValue="form" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">KYC Form</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="form" className="mt-4">
                  <KYCForm />
                </TabsContent>
                
                <TabsContent value="instructions" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>KYC Instructions</CardTitle>
                      <CardDescription>
                        Follow these guidelines for smooth KYC verification
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Required Documents</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span><strong>Aadhar Card:</strong> Both front and back sides</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span><strong>PAN Card:</strong> Clear image of your PAN card</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span><strong>Nominee Details:</strong> Name and relationship</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Photo Guidelines</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Clear, readable documents without blur</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>All four corners of the document visible</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Good lighting, no shadows</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500">✗</span>
                            <span>No screenshots or edited images</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500">✗</span>
                            <span>No black & white images</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Verification Process</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">1</span>
                            </div>
                            <div>
                              <p className="font-medium">Submit Documents</p>
                              <p className="text-gray-600">Fill the form and upload documents</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">2</span>
                            </div>
                            <div>
                              <p className="font-medium">Review Process</p>
                              <p className="text-gray-600">Our team verifies your documents (1-2 days)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-semibold">3</span>
                            </div>
                            <div>
                              <p className="font-medium">Approval</p>
                              <p className="text-gray-600">KYC approved, withdrawal limits removed</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Make sure all information matches your official documents. 
                          Any discrepancy may lead to rejection.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {kycData?.status === 'PENDING' && <Clock className="h-5 w-5 text-yellow-500" />}
                    {kycData?.status === 'APPROVED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    KYC Application Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {kycData && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Application Status</span>
                        <Badge variant={
                          kycData.status === 'APPROVED' ? 'default' :
                          kycData.status === 'PENDING' ? 'secondary' : 'destructive'
                        }>
                          {kycData.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Submitted:</span>
                          <p className="font-medium">
                            {new Date(kycData.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {kycData.reviewedAt && (
                          <div>
                            <span className="text-gray-600">Reviewed:</span>
                            <p className="font-medium">
                              {new Date(kycData.reviewedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {kycData.adminRemark && (
                        <div>
                          <span className="text-gray-600 text-sm">Admin Remarks:</span>
                          <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                            {kycData.adminRemark}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {kycData?.status === 'PENDING' && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Your KYC application is under review. We'll notify you once it's approved.
                      </AlertDescription>
                    </Alert>
                  )}

                  {kycData?.status === 'APPROVED' && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Congratulations! Your KYC has been approved. You can now withdraw without any limits.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}