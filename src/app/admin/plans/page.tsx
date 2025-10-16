'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target, 
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'

interface InvestmentPlan {
  id: string
  name: string
  amount: number
  dailyROI: number
  duration: number
  status: 'ACTIVE' | 'INACTIVE'
  description: string
  createdAt: string
  updatedAt: string
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dailyROI: '',
    duration: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    description: '',
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      // TODO: Replace with actual API call
      const mockPlans: InvestmentPlan[] = [
        {
          id: '1',
          name: 'Basic Plan',
          amount: 50,
          dailyROI: 15,
          duration: 30,
          status: 'ACTIVE',
          description: 'Perfect for beginners with low risk and steady returns.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Standard Plan',
          amount: 100,
          dailyROI: 18,
          duration: 30,
          status: 'ACTIVE',
          description: 'Balanced investment with moderate returns.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Premium Plan',
          amount: 200,
          dailyROI: 22,
          duration: 30,
          status: 'ACTIVE',
          description: 'High returns for experienced investors.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          name: 'Diamond Plan',
          amount: 500,
          dailyROI: 28,
          duration: 30,
          status: 'INACTIVE',
          description: 'Maximum returns for serious investors.',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ]
      
      setPlans(mockPlans)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch investment plans')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingPlan) {
        setPlans(prev => prev.map(plan => 
          plan.id === editingPlan.id 
            ? { ...plan, ...formData, amount: parseFloat(formData.amount), dailyROI: parseFloat(formData.dailyROI), duration: parseInt(formData.duration) }
            : plan
        ))
        toast.success('Plan updated successfully')
      } else {
        const newPlan: InvestmentPlan = {
          id: Date.now().toString(),
          ...formData,
          amount: parseFloat(formData.amount),
          dailyROI: parseFloat(formData.dailyROI),
          duration: parseInt(formData.duration),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setPlans(prev => [...prev, newPlan])
        toast.success('Plan created successfully')
      }
      
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to save plan')
    }
  }

  const handleEdit = (plan: InvestmentPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      amount: plan.amount.toString(),
      dailyROI: plan.dailyROI.toString(),
      duration: plan.duration.toString(),
      status: plan.status,
      description: plan.description,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setPlans(prev => prev.filter(plan => plan.id !== planId))
      toast.success('Plan deleted successfully')
    } catch (error) {
      toast.error('Failed to delete plan')
    }
  }

  const togglePlanStatus = async (planId: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { ...plan, status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : plan
      ))
      toast.success(`Plan ${currentStatus === 'ACTIVE' ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      toast.error('Failed to update plan status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      dailyROI: '',
      duration: '',
      status: 'ACTIVE',
      description: '',
    })
    setEditingPlan(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Investment Plans</h1>
          <p className="text-gray-600">Manage investment plans and ROI rates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Investment Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dailyROI">Daily ROI (%)</Label>
                <Input
                  id="dailyROI"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.dailyROI}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyROI: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (Days)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'ACTIVE' | 'INACTIVE') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update' : 'Create'} Plan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  {plan.name}
                </CardTitle>
                <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {plan.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-medium">₹{plan.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily ROI:</span>
                  <span className="font-medium text-green-600">{plan.dailyROI}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="font-medium">{plan.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Return:</span>
                  <span className="font-medium text-blue-600">
                    ₹{plan.amount + (plan.amount * plan.dailyROI * plan.duration / 100)}
                  </span>
                </div>
              </div>
              
              {plan.description && (
                <p className="text-sm text-gray-600">{plan.description}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePlanStatus(plan.id, plan.status)}
                >
                  {plan.status === 'ACTIVE' ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
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