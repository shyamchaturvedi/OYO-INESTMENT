'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Percent, 
  Users,
  Gift,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { toast } from 'sonner'

interface CommissionSetting {
  id: string
  level: number
  percentage: number
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CommissionSettingsPage() {
  const [commissions, setCommissions] = useState<CommissionSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCommission, setEditingCommission] = useState<CommissionSetting | null>(null)
  const [formData, setFormData] = useState({
    level: '',
    percentage: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    fetchCommissions()
  }, [])

  const fetchCommissions = async () => {
    try {
      // TODO: Replace with actual API call
      const mockCommissions: CommissionSetting[] = [
        {
          id: '1',
          level: 1,
          percentage: 10,
          description: 'Direct referral commission',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          level: 2,
          percentage: 5,
          description: 'Level 2 referral commission',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          level: 3,
          percentage: 3,
          description: 'Level 3 referral commission',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          level: 4,
          percentage: 2,
          description: 'Level 4 referral commission',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '5',
          level: 5,
          percentage: 1,
          description: 'Level 5 referral commission',
          isActive: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]
      
      setCommissions(mockCommissions)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch commission settings')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingCommission) {
        setCommissions(prev => prev.map(commission => 
          commission.id === editingCommission.id 
            ? { ...commission, ...formData, level: parseInt(formData.level), percentage: parseFloat(formData.percentage) }
            : commission
        ))
        toast.success('Commission updated successfully')
      } else {
        const newCommission: CommissionSetting = {
          id: Date.now().toString(),
          ...formData,
          level: parseInt(formData.level),
          percentage: parseFloat(formData.percentage),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setCommissions(prev => [...prev, newCommission])
        toast.success('Commission created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to save commission setting')
    }
  }

  const handleEdit = (commission: CommissionSetting) => {
    setEditingCommission(commission)
    setFormData({
      level: commission.level.toString(),
      percentage: commission.percentage.toString(),
      description: commission.description,
      isActive: commission.isActive,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (commissionId: string) => {
    if (!confirm('Are you sure you want to delete this commission setting?')) return
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setCommissions(prev => prev.filter(commission => commission.id !== commissionId))
      toast.success('Commission setting deleted successfully')
    } catch (error) {
      toast.error('Failed to delete commission setting')
    }
  }

  const toggleCommissionStatus = async (commissionId: string, currentStatus: boolean) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setCommissions(prev => prev.map(commission => 
        commission.id === commissionId 
          ? { ...commission, isActive: !currentStatus }
          : commission
      ))
      toast.success(`Commission ${currentStatus ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      toast.error('Failed to update commission status')
    }
  }

  const resetForm = () => {
    setFormData({
      level: '',
      percentage: '',
      description: '',
      isActive: true,
    })
    setEditingCommission(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Commission Settings</h1>
          <p className="text-gray-600">Manage referral commission percentages by level</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Commission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCommission ? 'Edit Commission' : 'Add New Commission'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="percentage">Commission Percentage (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Direct referral commission"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCommission ? 'Update' : 'Create'} Commission
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Commission Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Commission Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {commissions.filter(c => c.isActive).reduce((sum, c) => sum + c.percentage, 0)}%
              </div>
              <div className="text-sm text-gray-600">Total Active Commission</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {commissions.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Levels</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {commissions.length}
              </div>
              <div className="text-sm text-gray-600">Total Levels</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {commissions.sort((a, b) => a.level - b.level).map((commission) => (
          <Card key={commission.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Level {commission.level}
                </CardTitle>
                <Badge variant={commission.isActive ? 'default' : 'secondary'}>
                  {commission.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {commission.percentage}%
                </div>
                <div className="text-sm text-gray-600">Commission Rate</div>
              </div>
              
              {commission.description && (
                <p className="text-sm text-gray-600 text-center">{commission.description}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(commission)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(commission.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCommissionStatus(commission.id, commission.isActive)}
                >
                  {commission.isActive ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}