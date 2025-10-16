'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  User, 
  Key, 
  Shield, 
  Plus,
  Edit,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Users,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminProfile {
  id: string
  fullName: string
  email: string
  mobile: string
  role: string
  createdAt: string
  lastLoginAt: string
}

interface NewAdminData {
  fullName: string
  email: string
  mobile: string
  password: string
  confirmPassword: string
}

export default function AdminSettingsPage() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile update states
  const [editMode, setEditMode] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobile: '',
  })
  
  // Password change states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  
  // New admin creation states
  const [createAdminDialog, setCreateAdminDialog] = useState(false)
  const [newAdminData, setNewAdminData] = useState<NewAdminData>({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  })
  const [creatingAdmin, setCreatingAdmin] = useState(false)

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      // TODO: Replace with actual API call
      const mockAdmin: AdminProfile = {
        id: '1',
        fullName: 'Admin User',
        email: 'iammshyam@gmail.com',
        mobile: '+91 9876543210',
        role: 'ADMIN',
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: new Date().toISOString(),
      }
      
      setAdminProfile(mockAdmin)
      setProfileData({
        fullName: mockAdmin.fullName,
        email: mockAdmin.email,
        mobile: mockAdmin.mobile,
      })
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch admin profile')
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAdminProfile(prev => prev ? {
        ...prev,
        ...profileData,
        updatedAt: new Date().toISOString(),
      } : null)
      
      toast.success('Profile updated successfully')
      setEditMode(false)
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Password change successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Failed to change password')
    }
  }

  const handleCreateAdmin = async () => {
    if (newAdminData.password !== newAdminData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (newAdminData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    if (!newAdminData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!newAdminData.mobile || newAdminData.mobile.length !== 10) {
      toast.error('Please enter a valid 10 digit mobile number')
      return
    }

    setCreatingAdmin(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newAdminData.fullName,
          email: newAdminData.email,
          mobile: newAdminData.mobile,
          password: newAdminData.password,
        }),
      })

      if (response.ok) {
        toast.success('New admin created successfully')
        setCreateAdminDialog(false)
        setNewAdminData({
          fullName: '',
          email: '',
          mobile: '',
          password: '',
          confirmPassword: '',
        })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create admin')
      }
    } catch (error) {
      toast.error('Failed to create admin')
    } finally {
      setCreatingAdmin(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600">Manage your admin account and settings</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Key className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Admins
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Information
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => editMode ? handleProfileUpdate() : setEditMode(true)}
                >
                  {editMode ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={profileData.mobile}
                    onChange={(e) => setProfileData(prev => ({ ...prev, mobile: e.target.value }))}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={adminProfile?.role || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Account Created</Label>
                  <div className="font-medium">
                    {adminProfile ? new Date(adminProfile.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">Last Login</Label>
                  <div className="font-medium">
                    {adminProfile ? new Date(adminProfile.lastLoginAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4" />
                <span>Password must be at least 6 characters long</span>
              </div>

              <Button onClick={handlePasswordChange} className="w-full">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-gray-600">Additional security layer</div>
                    </div>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Login Alerts</div>
                      <div className="text-sm text-gray-600">Get notified on new logins</div>
                    </div>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Admin Management
                </CardTitle>
                <Dialog open={createAdminDialog} onOpenChange={setCreateAdminDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create New Admin Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="adminFullName">Full Name</Label>
                        <Input
                          id="adminFullName"
                          value={newAdminData.fullName}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Enter admin full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminEmail">Email Address</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={newAdminData.email}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter admin email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminMobile">Mobile Number</Label>
                        <Input
                          id="adminMobile"
                          value={newAdminData.mobile}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, mobile: e.target.value }))}
                          placeholder="Enter 10 digit mobile number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminPassword">Password</Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          value={newAdminData.password}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
                        <Input
                          id="adminConfirmPassword"
                          type="password"
                          value={newAdminData.confirmPassword}
                          onChange={(e) => setNewAdminData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm password"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setCreateAdminDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAdmin} disabled={creatingAdmin}>
                          {creatingAdmin ? 'Creating...' : 'Create Admin'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminProfile && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{adminProfile.fullName}</h4>
                        <p className="text-sm text-gray-600">{adminProfile.email}</p>
                        <p className="text-sm text-gray-600">{adminProfile.mobile}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Super Admin</Badge>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Only one admin account exists</p>
                  <p className="text-sm">Create additional admins to help manage the platform</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}