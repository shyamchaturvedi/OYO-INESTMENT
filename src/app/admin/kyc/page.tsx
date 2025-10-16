'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Search,
  Filter,
  AlertTriangle,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import { KYCStatus } from '@prisma/client'

interface KYCApplication {
  id: string
  userId: string
  user: {
    fullName: string
    email: string
    mobile: string
  }
  aadharNumber: string
  panNumber: string
  nomineeName: string
  nomineeRelation: string
  aadharFront: string
  aadharBack: string
  panCard: string
  status: KYCStatus
  adminRemark?: string
  submittedAt: string
  reviewedAt?: string
}

export default function KYCManagement() {
  const [applications, setApplications] = useState<KYCApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<KYCApplication | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [reviewForm, setReviewForm] = useState({
    status: 'APPROVED' as KYCStatus,
    adminRemark: ''
  })
  const [isReviewing, setIsReviewing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/kyc')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      } else {
        toast.error('Failed to fetch KYC applications')
      }
    } catch (error) {
      console.error('Error fetching KYC applications:', error)
      toast.error('Failed to fetch KYC applications')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (applicationId: string) => {
    if (!reviewForm.adminRemark.trim()) {
      toast.error('Please provide admin remarks')
      return
    }

    setIsReviewing(true)
    try {
      const response = await fetch(`/api/admin/kyc/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      })

      if (response.ok) {
        toast.success(`KYC application ${reviewForm.status.toLowerCase()} successfully`)
        fetchApplications()
        setSelectedApplication(null)
        setReviewForm({ status: 'APPROVED', adminRemark: '' })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to review application')
      }
    } catch (error) {
      console.error('Error reviewing application:', error)
      toast.error('Failed to review application')
    } finally {
      setIsReviewing(false)
    }
  }

  const getStatusBadge = (status: KYCStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileCheck className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = searchTerm === '' || 
      app.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.aadharNumber.includes(searchTerm) ||
      app.panNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    approved: applications.filter(app => app.status === 'APPROVED').length,
    rejected: applications.filter(app => app.status === 'REJECTED').length,
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-gray-600">Manage user KYC applications and compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, mobile, Aadhar, or PAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Aadhar</th>
                  <th className="text-left py-3 px-4">PAN</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Submitted</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{application.user.fullName}</div>
                        <div className="text-sm text-gray-500">{application.user.email}</div>
                        <div className="text-sm text-gray-500">{application.user.mobile}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm">
                        {application.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm uppercase">{application.panNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        {getStatusBadge(application.status)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                      {application.reviewedAt && (
                        <div className="text-xs text-gray-500">
                          Reviewed: {new Date(application.reviewedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <FileCheck className="h-5 w-5" />
                              KYC Application Review
                            </DialogTitle>
                            <DialogDescription>
                              Review and verify the user's KYC documents
                            </DialogDescription>
                          </DialogHeader>

                          {selectedApplication && (
                            <div className="space-y-6">
                              {/* User Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Full Name</Label>
                                  <p className="text-sm">{selectedApplication.user.fullName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Email</Label>
                                  <p className="text-sm">{selectedApplication.user.email}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Mobile</Label>
                                  <p className="text-sm">{selectedApplication.user.mobile}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Submitted</Label>
                                  <p className="text-sm">
                                    {new Date(selectedApplication.submittedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* KYC Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Aadhar Number</Label>
                                  <p className="text-sm font-mono">
                                    {selectedApplication.aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">PAN Number</Label>
                                  <p className="text-sm font-mono uppercase">{selectedApplication.panNumber}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Nominee Name</Label>
                                  <p className="text-sm">{selectedApplication.nomineeName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Nominee Relation</Label>
                                  <p className="text-sm">{selectedApplication.nomineeRelation}</p>
                                </div>
                              </div>

                              {/* Document Preview */}
                              <div>
                                <Label className="text-sm font-medium mb-4 block">Documents</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="border rounded-lg p-4">
                                    <div className="text-sm font-medium mb-2">Aadhar Front</div>
                                    <div className="bg-gray-100 rounded p-2 text-center">
                                      <img 
                                        src={selectedApplication.aadharFront} 
                                        alt="Aadhar Front"
                                        className="w-full h-32 object-cover rounded"
                                      />
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full mt-2"
                                      onClick={() => window.open(selectedApplication.aadharFront, '_blank')}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>

                                  <div className="border rounded-lg p-4">
                                    <div className="text-sm font-medium mb-2">Aadhar Back</div>
                                    <div className="bg-gray-100 rounded p-2 text-center">
                                      <img 
                                        src={selectedApplication.aadharBack} 
                                        alt="Aadhar Back"
                                        className="w-full h-32 object-cover rounded"
                                      />
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full mt-2"
                                      onClick={() => window.open(selectedApplication.aadharBack, '_blank')}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>

                                  <div className="border rounded-lg p-4">
                                    <div className="text-sm font-medium mb-2">PAN Card</div>
                                    <div className="bg-gray-100 rounded p-2 text-center">
                                      <img 
                                        src={selectedApplication.panCard} 
                                        alt="PAN Card"
                                        className="w-full h-32 object-cover rounded"
                                      />
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full mt-2"
                                      onClick={() => window.open(selectedApplication.panCard, '_blank')}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Review Form */}
                              {selectedApplication.status === 'PENDING' && (
                                <div className="space-y-4 border-t pt-4">
                                  <div>
                                    <Label htmlFor="status">Review Decision</Label>
                                    <Select 
                                      value={reviewForm.status} 
                                      onValueChange={(value: KYCStatus) => 
                                        setReviewForm(prev => ({ ...prev, status: value }))
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="APPROVED">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Approve
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="REJECTED">
                                          <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            Reject
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="adminRemark">Admin Remarks *</Label>
                                    <Textarea
                                      id="adminRemark"
                                      placeholder="Provide detailed feedback for your decision..."
                                      value={reviewForm.adminRemark}
                                      onChange={(e) => setReviewForm(prev => ({ 
                                        ...prev, 
                                        adminRemark: e.target.value 
                                      }))}
                                      rows={3}
                                    />
                                  </div>

                                  {reviewForm.status === 'REJECTED' && (
                                    <Alert>
                                      <AlertTriangle className="h-4 w-4" />
                                      <AlertDescription>
                                        User will need to resubmit KYC documents after rejection.
                                      </AlertDescription>
                                    </Alert>
                                  )}

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleReview(selectedApplication.id)}
                                      disabled={isReviewing || !reviewForm.adminRemark.trim()}
                                      className={reviewForm.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
                                    >
                                      {isReviewing ? (
                                        'Processing...'
                                      ) : (
                                        <>
                                          {reviewForm.status === 'APPROVED' ? (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                          ) : (
                                            <XCircle className="h-4 w-4 mr-2" />
                                          )}
                                          {reviewForm.status === 'APPROVED' ? 'Approve KYC' : 'Reject KYC'}
                                        </>
                                      )}
                                    </Button>
                                    <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {selectedApplication.status !== 'PENDING' && (
                                <div className="border-t pt-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusIcon(selectedApplication.status)}
                                    <span className="font-medium">
                                      Status: {selectedApplication.status}
                                    </span>
                                  </div>
                                  {selectedApplication.adminRemark && (
                                    <div>
                                      <Label className="text-sm font-medium">Admin Remarks</Label>
                                      <p className="text-sm bg-gray-50 p-3 rounded">
                                        {selectedApplication.adminRemark}
                                      </p>
                                    </div>
                                  )}
                                  {selectedApplication.reviewedAt && (
                                    <div className="text-sm text-gray-500 mt-2">
                                      Reviewed on: {new Date(selectedApplication.reviewedAt).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredApplications.length === 0 && (
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No KYC applications found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}