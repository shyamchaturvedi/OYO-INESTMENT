'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  QrCode,
  Star,
  Copy,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react'
import { toast } from 'sonner'

interface UPIPayment {
  id: string
  upiId: string
  displayName: string
  isActive: boolean
  isDefault: boolean
  description: string
  qrCode: string
  createdAt: string
  updatedAt: string
}

export default function UPIPaymentsPage() {
  const [upiPayments, setUpiPayments] = useState<UPIPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUPI, setEditingUPI] = useState<UPIPayment | null>(null)
  const [formData, setFormData] = useState({
    upiId: '',
    displayName: '',
    isActive: true,
    isDefault: false,
    description: '',
    qrCode: '',
  })

  useEffect(() => {
    fetchUPIPayments()
  }, [])

  const fetchUPIPayments = async () => {
    try {
      // TODO: Replace with actual API call
      const mockUPIPayments: UPIPayment[] = [
        {
          id: '1',
          upiId: 'poweroyo@ybl',
          displayName: 'PowerOYO Official',
          isActive: true,
          isDefault: true,
          description: 'Primary UPI payment account',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          upiId: 'payments@poweroyo',
          displayName: 'PowerOYO Payments',
          isActive: true,
          isDefault: false,
          description: 'Secondary UPI payment account',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          upiId: 'support@poweroyo',
          displayName: 'PowerOYO Support',
          isActive: false,
          isDefault: false,
          description: 'Support UPI account',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]
      
      setUpiPayments(mockUPIPayments)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch UPI payments')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingUPI) {
        setUpiPayments(prev => prev.map(upi => 
          upi.id === editingUPI.id 
            ? { ...upi, ...formData }
            : upi
        ))
        toast.success('UPI payment updated successfully')
      } else {
        const newUPI: UPIPayment = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setUpiPayments(prev => [...prev, newUPI])
        toast.success('UPI payment created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to save UPI payment')
    }
  }

  const handleEdit = (upi: UPIPayment) => {
    setEditingUPI(upi)
    setFormData({
      upiId: upi.upiId,
      displayName: upi.displayName,
      isActive: upi.isActive,
      isDefault: upi.isDefault,
      description: upi.description,
      qrCode: upi.qrCode,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (upiId: string) => {
    if (!confirm('Are you sure you want to delete this UPI payment?')) return
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUpiPayments(prev => prev.filter(upi => upi.id !== upiId))
      toast.success('UPI payment deleted successfully')
    } catch (error) {
      toast.error('Failed to delete UPI payment')
    }
  }

  const toggleUPIStatus = async (upiId: string, currentStatus: boolean) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUpiPayments(prev => prev.map(upi => 
        upi.id === upiId 
          ? { ...upi, isActive: !currentStatus }
          : upi
      ))
      toast.success(`UPI payment ${currentStatus ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      toast.error('Failed to update UPI payment status')
    }
  }

  const setDefaultUPI = async (upiId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUpiPayments(prev => prev.map(upi => ({
        ...upi,
        isDefault: upi.id === upiId
      })))
      toast.success('Default UPI payment updated successfully')
    } catch (error) {
      toast.error('Failed to set default UPI payment')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('UPI ID copied to clipboard')
  }

  const handleQRCodeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Handle file upload and convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          qrCode: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      upiId: '',
      displayName: '',
      isActive: true,
      isDefault: false,
      description: '',
      qrCode: '',
    })
    setEditingUPI(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">UPI Payments</h1>
          <p className="text-gray-600">Manage UPI payment methods and QR codes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add UPI Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingUPI ? 'Edit UPI Payment' : 'Add New UPI Payment'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={formData.upiId}
                  onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                  placeholder="example@ybl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Payment Display Name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Payment description"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="qrCode">QR Code</Label>
                <Input
                  id="qrCode"
                  type="file"
                  accept="image/*"
                  onChange={handleQRCodeUpload}
                  className="mb-2"
                />
                {formData.qrCode && (
                  <div className="mt-2">
                    <img
                      src={formData.qrCode}
                      alt="QR Code"
                      className="h-32 w-32 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">Default Payment Method</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUPI ? 'Update' : 'Create'} UPI Payment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* UPI Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            UPI Payment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {upiPayments.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active UPI Payments</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {upiPayments.length}
              </div>
              <div className="text-sm text-gray-600">Total UPI Payments</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {upiPayments.find(u => u.isDefault)?.displayName || 'None'}
              </div>
              <div className="text-sm text-gray-600">Default Payment</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UPI Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upiPayments.map((upi) => (
          <Card key={upi.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {upi.displayName}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {upi.isDefault && (
                    <Badge variant="default" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                  <Badge variant={upi.isActive ? 'default' : 'secondary'}>
                    {upi.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">UPI ID:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{upi.upiId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(upi.upiId)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {upi.description && (
                <p className="text-sm text-gray-600">{upi.description}</p>
              )}

              {upi.qrCode && (
                <div className="flex justify-center">
                  <img
                    src={upi.qrCode}
                    alt="QR Code"
                    className="h-24 w-24 object-contain border rounded"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(upi)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(upi.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUPIStatus(upi.id, upi.isActive)}
                  >
                    {upi.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  {!upi.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultUPI(upi.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}