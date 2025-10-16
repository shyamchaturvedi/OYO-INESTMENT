'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  ArrowDownUp,
  ArrowUpFromDot,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  Target,
  History
} from 'lucide-react'
import { toast } from 'sonner'

interface UserDetails {
  id: string
  fullName: string
  email: string
  mobile: string
  password: string
  referralCode: string
  referredBy: string
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  walletBalance: number
  totalEarnings: number
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  emailVerified: boolean
  mobileVerified: boolean
  lastLoginAt: string
  createdAt: string
  updatedAt: string
  address: string
  city: string
  state: string
  pincode: string
}

interface UserInvestment {
  id: string
  planName: string
  amount: number
  dailyROI: number
  totalDays: number
  remainingDays: number
  totalEarned: number
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
}

interface UserWithdrawal {
  id: string
  amount: number
  method: 'UPI' | 'BANK_TRANSFER'
  details: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminRemark: string
  createdAt: string
  processedAt: string
}

interface UserTransaction {
  id: string
  type: 'INVESTMENT' | 'ROI' | 'REFERRAL' | 'WITHDRAWAL' | 'ADD_FUNDS' | 'BONUS'
  amount: number
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserDetails[]>([])
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([])
  const [userWithdrawals, setUserWithdrawals] = useState<UserWithdrawal[]>([])
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'BLOCKED',
    walletBalance: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // TODO: Replace with actual API call
      const mockUsers: UserDetails[] = [
        {
          id: '1',
          fullName: 'John Doe',
          email: 'john@example.com',
          mobile: '+91 9876543210',
          password: 'hashedpassword',
          referralCode: 'JOHN123',
          referredBy: '',
          role: 'USER',
          status: 'ACTIVE',
          walletBalance: 1250.75,
          totalEarnings: 3250.50,
          kycStatus: 'APPROVED',
          emailVerified: true,
          mobileVerified: true,
          lastLoginAt: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          address: '123, Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        {
          id: '2',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          mobile: '+91 9876543211',
          password: 'hashedpassword',
          referralCode: 'JANE456',
          referredBy: 'JOHN123',
          role: 'USER',
          status: 'ACTIVE',
          walletBalance: 850.00,
          totalEarnings: 2100.25,
          kycStatus: 'PENDING',
          emailVerified: true,
          mobileVerified: false,
          lastLoginAt: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-14T15:45:00Z',
          address: '456, Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
        },
        {
          id: '3',
          fullName: 'Bob Johnson',
          email: 'bob@example.com',
          mobile: '+91 9876543212',
          password: 'hashedpassword',
          referralCode: 'BOB789',
          referredBy: 'JOHN123',
          role: 'USER',
          status: 'INACTIVE',
          walletBalance: 450.50,
          totalEarnings: 890.75,
          kycStatus: 'REJECTED',
          emailVerified: false,
          mobileVerified: true,
          lastLoginAt: '2024-01-10T09:20:00Z',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-10T09:20:00Z',
          address: '789, Cross Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
        },
      ]
      
      setUsers(mockUsers)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch users')
      setLoading(false)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      // TODO: Replace with actual API call
      const mockInvestments: UserInvestment[] = [
        {
          id: '1',
          planName: 'Standard Plan',
          amount: 100,
          dailyROI: 18,
          totalDays: 30,
          remainingDays: 15,
          totalEarned: 270,
          status: 'ACTIVE',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T00:00:00Z',
        },
        {
          id: '2',
          planName: 'Premium Plan',
          amount: 200,
          dailyROI: 22,
          totalDays: 30,
          remainingDays: 0,
          totalEarned: 1320,
          status: 'COMPLETED',
          startDate: '2023-12-01T00:00:00Z',
          endDate: '2023-12-31T00:00:00Z',
        },
      ]

      const mockWithdrawals: UserWithdrawal[] = [
        {
          id: '1',
          amount: 500,
          method: 'UPI',
          details: 'john@ybl',
          status: 'APPROVED',
          adminRemark: 'Processed successfully',
          createdAt: '2024-01-10T10:00:00Z',
          processedAt: '2024-01-10T14:30:00Z',
        },
        {
          id: '2',
          amount: 300,
          method: 'UPI',
          details: 'john@paytm',
          status: 'PENDING',
          adminRemark: '',
          createdAt: '2024-01-15T11:00:00Z',
          processedAt: '',
        },
      ]

      const mockTransactions: UserTransaction[] = [
        {
          id: '1',
          type: 'INVESTMENT',
          amount: 100,
          description: 'Standard Plan Investment',
          status: 'COMPLETED',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          type: 'ROI',
          amount: 18,
          description: 'Daily ROI - Standard Plan',
          status: 'COMPLETED',
          createdAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          type: 'REFERRAL',
          amount: 50,
          description: 'Referral Bonus from Jane Smith',
          status: 'COMPLETED',
          createdAt: '2024-01-02T12:00:00Z',
        },
        {
          id: '4',
          type: 'WITHDRAWAL',
          amount: 500,
          description: 'Withdrawal to UPI',
          status: 'COMPLETED',
          createdAt: '2024-01-10T10:00:00Z',
        },
      ]

      setUserInvestments(mockInvestments)
      setUserWithdrawals(mockWithdrawals)
      setUserTransactions(mockTransactions)
    } catch (error) {
      toast.error('Failed to fetch user details')
    }
  }

  const handleUserClick = (user: UserDetails) => {
    setSelectedUser(user)
    setFormData({
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile,
      status: user.status,
      walletBalance: user.walletBalance.toString(),
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
    })
    fetchUserDetails(user.id)
    setDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? {
              ...user,
              ...formData,
              walletBalance: parseFloat(formData.walletBalance),
              updatedAt: new Date().toISOString(),
            }
          : user
      ))
      
      toast.success('User updated successfully')
      setEditMode(false)
      setSelectedUser(null)
      setDialogOpen(false)
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus, updatedAt: new Date().toISOString() }
          : user
      ))
      
      toast.success(`User status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'INACTIVE':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Inactive</Badge>
      case 'BLOCKED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Blocked</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    const colors = {
      INVESTMENT: 'bg-blue-100 text-blue-800',
      ROI: 'bg-green-100 text-green-800',
      REFERRAL: 'bg-purple-100 text-purple-800',
      WITHDRAWAL: 'bg-red-100 text-red-800',
      ADD_FUNDS: 'bg-yellow-100 text-yellow-800',
      BONUS: 'bg-orange-100 text-orange-800',
    }
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ')}
      </Badge>
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobile.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesKyc = kycFilter === 'all' || user.kycStatus === kycFilter
    return matchesSearch && matchesStatus && matchesKyc
  })

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length
  const totalWalletBalance = users.reduce((sum, u) => sum + u.walletBalance, 0)
  const totalEarnings = users.reduce((sum, u) => sum + u.totalEarnings, 0)

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and view their complete details</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Users
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Wallet Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{totalWalletBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{totalEarnings.toLocaleString()}
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
                  placeholder="Search by name, email, or mobile..."
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-700">User</th>
                  <th className="text-left p-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left p-4 font-medium text-gray-700">Wallet</th>
                  <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 font-medium text-gray-700">KYC</th>
                  <th className="text-left p-4 font-medium text-gray-700">Joined</th>
                  <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-600">Ref: {user.referralCode}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.mobile}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">₹{user.walletBalance.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Earned: ₹{user.totalEarnings.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4">
                      {getKycBadge(user.kycStatus)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserClick(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={user.status}
                          onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') => 
                            handleStatusChange(user.id, value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="BLOCKED">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>User Details</span>
              <div className="flex space-x-2">
                {editMode ? (
                  <>
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateUser}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="investments">Investments</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') => 
                        setFormData(prev => ({ ...prev, status: value }))
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="BLOCKED">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="walletBalance">Wallet Balance</Label>
                    <Input
                      id="walletBalance"
                      type="number"
                      value={formData.walletBalance}
                      onChange={(e) => setFormData(prev => ({ ...prev, walletBalance: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="referralCode">Referral Code</Label>
                    <Input
                      id="referralCode"
                      value={selectedUser.referralCode}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">KYC Status</div>
                    <div className="mt-1">{getKycBadge(selectedUser.kycStatus)}</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Email Verified</div>
                    <div className="mt-1">
                      {selectedUser.emailVerified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Mobile Verified</div>
                    <div className="mt-1">
                      {selectedUser.mobileVerified ? (
                        <Badge variant="default">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">Total Earnings</div>
                    <div className="mt-1 font-bold">₹{selectedUser.totalEarnings.toLocaleString()}</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="investments" className="space-y-4">
                <div className="space-y-3">
                  {userInvestments.map((investment) => (
                    <div key={investment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{investment.planName}</h4>
                          <p className="text-sm text-gray-600">
                            Amount: ₹{investment.amount} | Daily ROI: {investment.dailyROI}%
                          </p>
                        </div>
                        <Badge variant={investment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {investment.status}
                        </Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Start Date:</span>
                          <div>{new Date(investment.startDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">End Date:</span>
                          <div>{new Date(investment.endDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Remaining:</span>
                          <div>{investment.remainingDays} days</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Earned:</span>
                          <div className="font-medium">₹{investment.totalEarned}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="withdrawals" className="space-y-4">
                <div className="space-y-3">
                  {userWithdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">₹{withdrawal.amount}</h4>
                          <p className="text-sm text-gray-600">
                            Method: {withdrawal.method} | {withdrawal.details}
                          </p>
                        </div>
                        <Badge variant={
                          withdrawal.status === 'APPROVED' ? 'default' : 
                          withdrawal.status === 'REJECTED' ? 'destructive' : 'secondary'
                        }>
                          {withdrawal.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="text-gray-600">
                          Requested: {new Date(withdrawal.createdAt).toLocaleString()}
                        </div>
                        {withdrawal.processedAt && (
                          <div className="text-gray-600">
                            Processed: {new Date(withdrawal.processedAt).toLocaleString()}
                          </div>
                        )}
                        {withdrawal.adminRemark && (
                          <div className="text-gray-600">
                            Remark: {withdrawal.adminRemark}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="transactions" className="space-y-4">
                <div className="space-y-3">
                  {userTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {transaction.type === 'WITHDRAWAL' ? '-' : '+'}₹{transaction.amount}
                          </div>
                          <div className="mt-1">
                            {getTransactionTypeBadge(transaction.type)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}