'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowUpFromDot, 
  Check, 
  X, 
  Eye, 
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'

interface FundRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  method: 'UPI' | 'BANK_TRANSFER' | 'CASH' | 'OTHER'
  transactionId: string
  screenshot: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminRemark: string
  processedAt: string
  createdAt: string
  updatedAt: string
}

export default function FundRequestsPage() {
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<FundRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [adminRemark, setAdminRemark] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchFundRequests()
  }, [])

  const fetchFundRequests = async () => {
    try {
      // TODO: Replace with actual API call
      const mockFundRequests: FundRequest[] = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          amount: 1000,
          method: 'UPI',
          transactionId: 'TXN123456789',
          screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          status: 'PENDING',
          adminRemark: '',
          processedAt: '',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          amount: 2500,
          method: 'BANK_TRANSFER',
          transactionId: 'BANK987654321',
          screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          status: 'PENDING',
          adminRemark: '',
          processedAt: '',
          createdAt: '2024-01-15T09:15:00Z',
          updatedAt: '2024-01-15T09:15:00Z',
        },
        {
          id: '3',
          userId: '3',
          userName: 'Bob Johnson',
          userEmail: 'bob@example.com',
          amount: 500,
          method: 'UPI',
          transactionId: 'TXN555666777',
          screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          status: 'APPROVED',
          adminRemark: 'Payment verified and processed',
          processedAt: '2024-01-14T14:20:00Z',
          createdAt: '2024-01-14T11:00:00Z',
          updatedAt: '2024-01-14T14:20:00Z',
        },
        {
          id: '4',
          userId: '4',
          userName: 'Alice Brown',
          userEmail: 'alice@example.com',
          amount: 1500,
          method: 'UPI',
          transactionId: 'TXN111222333',
          screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          status: 'REJECTED',
          adminRemark: 'Invalid transaction ID',
          processedAt: '2024-01-13T16:45:00Z',
          createdAt: '2024-01-13T13:30:00Z',
          updatedAt: '2024-01-13T16:45:00Z',
        },
      ]
      
      setFundRequests(mockFundRequests)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch fund requests')
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setFundRequests(prev => prev.map(request => 
        request.id === selectedRequest.id 
          ? {
              ...request,
              status: actionType === 'approve' ? 'APPROVED' : 'REJECTED',
              adminRemark: adminRemark,
              processedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : request
      ))
      
      toast.success(`Fund request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`)
      setDialogOpen(false)
      setSelectedRequest(null)
      setActionType(null)
      setAdminRemark('')
    } catch (error) {
      toast.error(`Failed to ${actionType} fund request`)
    }
  }

  const openActionDialog = (request: FundRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminRemark('')
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      UPI: 'bg-blue-100 text-blue-800',
      BANK_TRANSFER: 'bg-green-100 text-green-800',
      CASH: 'bg-yellow-100 text-yellow-800',
      OTHER: 'bg-gray-100 text-gray-800',
    }
    return (
      <Badge className={colors[method as keyof typeof colors] || colors.OTHER}>
        {method.replace('_', ' ')}
      </Badge>
    )
  }

  const filteredRequests = fundRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPendingAmount = fundRequests
    .filter(r => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0)

  const todayRequests = fundRequests.filter(r => 
    new Date(r.createdAt).toDateString() === new Date().toDateString()
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fund Requests</h1>
          <p className="text-gray-600">Manage user fund add requests</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {fundRequests.filter(r => r.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Amount
            </CardTitle>
            <ArrowUpFromDot className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalPendingAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Requests
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {todayRequests}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Processed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {fundRequests.filter(r => r.status !== 'PENDING').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Fund Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fund Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-700">User</th>
                  <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left p-4 font-medium text-gray-700">Method</th>
                  <th className="text-left p-4 font-medium text-gray-700">Transaction ID</th>
                  <th className="text-left p-4 font-medium text-gray-700">Screenshot</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">Date</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{request.userName}</div>
                        <div className="text-sm text-gray-600">{request.userEmail}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">₹{request.amount.toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      {getMethodBadge(request.method)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-mono text-gray-600">
                        {request.transactionId}
                      </div>
                    </td>
                    <td className="p-4">
                      {request.screenshot ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setActionType(null)
                            setDialogOpen(true)
                          }}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-400">No screenshot</span>
                      )}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setActionType(null)
                            setDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog(request, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog(request, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action/View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {actionType ? `${actionType === 'approve' ? 'Approve' : 'Reject'} Fund Request` : 'Fund Request Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">User</Label>
                  <div className="font-medium">{selectedRequest.userName}</div>
                  <div className="text-sm text-gray-600">{selectedRequest.userEmail}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <div className="font-medium text-lg">₹{selectedRequest.amount.toLocaleString()}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Method</Label>
                  <div>{getMethodBadge(selectedRequest.method)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Transaction ID</Label>
                  <div className="font-mono text-sm">{selectedRequest.transactionId}</div>
                </div>
              </div>
              {selectedRequest.screenshot && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment Screenshot</Label>
                  <div className="mt-2">
                    <img
                      src={selectedRequest.screenshot}
                      alt="Payment Screenshot"
                      className="max-w-full h-auto border rounded"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Requested Date</Label>
                <div className="text-sm text-gray-600">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </div>
              </div>
              {actionType && (
                <div>
                  <Label htmlFor="adminRemark">Admin Remark</Label>
                  <Textarea
                    id="adminRemark"
                    value={adminRemark}
                    onChange={(e) => setAdminRemark(e.target.value)}
                    placeholder={actionType === 'approve' ? 'Add approval note...' : 'Add rejection reason...'}
                    rows={3}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {actionType ? 'Cancel' : 'Close'}
                </Button>
                {actionType && (
                  <Button
                    onClick={handleAction}
                    className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}