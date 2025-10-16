'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { KYCStatus } from '@prisma/client'

interface KYCStatusProps {
  kycStatus: KYCStatus
  totalWithdrawn: number
  onGoToKYC?: () => void
}

export default function KYCStatusComponent({ kycStatus, totalWithdrawn, onGoToKYC }: KYCStatusProps) {
  const getStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending Review</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-500">Verified</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  const getStatusMessage = (status: KYCStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Your KYC documents are under review. This usually takes 1-2 business days.'
      case 'APPROVED':
        return 'Your KYC has been verified successfully. You can now withdraw without any limits.'
      case 'REJECTED':
        return 'Your KYC was rejected. Please check the remarks and resubmit with correct documents.'
      default:
        return 'Complete your KYC verification to continue withdrawals.'
    }
  }

  const needsKYC = totalWithdrawn >= 500
  const kycLimit = 500 - totalWithdrawn

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          KYC Verification Status
        </CardTitle>
        <CardDescription>
          RBI compliance: KYC mandatory for withdrawals exceeding ₹500
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(kycStatus)}
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-muted-foreground">
                {getStatusMessage(kycStatus)}
              </p>
            </div>
          </div>
          {getStatusBadge(kycStatus)}
        </div>

        {/* Withdrawal Limit Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Withdrawn</span>
            <span className="text-sm font-bold">₹{totalWithdrawn.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">KYC Limit</span>
            <span className="text-sm font-bold">₹500.00</span>
          </div>
          
          {kycStatus !== 'APPROVED' && (
            <div className="mt-3 pt-3 border-t">
              {needsKYC ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    You have reached the ₹500 withdrawal limit. Complete KYC to continue withdrawals.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>You can withdraw ₹{kycLimit.toFixed(2)} more before KYC is required.</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(totalWithdrawn / 500) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {kycStatus === 'PENDING' && (
            <Button variant="outline" size="sm" disabled>
              <Clock className="h-4 w-4 mr-2" />
              Under Review
            </Button>
          )}
          
          {kycStatus === 'REJECTED' && onGoToKYC && (
            <Button onClick={onGoToKYC} size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Resubmit KYC
            </Button>
          )}
          
          {(kycStatus === 'PENDING' || kycStatus === 'NOT_SUBMITTED') && needsKYC && onGoToKYC && (
            <Button onClick={onGoToKYC} size="sm" className="bg-orange-500 hover:bg-orange-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Complete KYC Now
            </Button>
          )}
          
          {kycStatus === 'APPROVED' && (
            <Button variant="outline" size="sm" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              KYC Complete
            </Button>
          )}
        </div>

        {/* RBI Compliance Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">RBI Compliance Notice</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• As per RBI guidelines, KYC verification is mandatory for cumulative withdrawals exceeding ₹500</p>
            <p>• Your documents are securely stored and used only for verification purposes</p>
            <p>• We comply with all RBI AML (Anti-Money Laundering) regulations</p>
            <p>• For any KYC-related queries, please contact support</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}