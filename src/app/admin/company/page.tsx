'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Building2, Save, Edit2 } from 'lucide-react'
import { toast } from 'sonner'

interface CompanyDetails {
  id: string
  name: string
  email: string
  phone: string
  address: string
  description: string
  logo: string
  gstin: string
  pan: string
  upiId: string
  supportEmail: string
  supportPhone: string
  website: string
  socialLinks: string
}

export default function CompanyDetailsPage() {
  const [company, setCompany] = useState<CompanyDetails>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: '',
    gstin: '',
    pan: '',
    upiId: '',
    supportEmail: '',
    supportPhone: '',
    website: '',
    socialLinks: '',
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCompanyDetails()
  }, [])

  const fetchCompanyDetails = async () => {
    try {
      // TODO: Replace with actual API call
      const mockCompany: CompanyDetails = {
        id: '1',
        name: 'PowerOYO Investment Solutions',
        email: 'info@poweroyo.com',
        phone: '+91 9876543210',
        address: '123, Business Park, Mumbai, Maharashtra 400001',
        description: 'Leading investment platform providing secure and profitable investment opportunities.',
        logo: '/logo.png',
        gstin: '27AAAPL1234C1ZV',
        pan: 'AAAPL1234C',
        upiId: 'poweroyo@ybl',
        supportEmail: 'support@poweroyo.com',
        supportPhone: '+91 9876543210',
        website: 'https://poweroyo.com',
        socialLinks: JSON.stringify({
          facebook: 'https://facebook.com/poweroyo',
          twitter: 'https://twitter.com/poweroyo',
          instagram: 'https://instagram.com/poweroyo',
        }),
      }
      
      setCompany(mockCompany)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch company details')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Company details updated successfully')
      setEditing(false)
    } catch (error) {
      toast.error('Failed to update company details')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof CompanyDetails, value: string) => {
    setCompany(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Handle file upload
      toast.success('Logo uploaded successfully')
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
          <h1 className="text-3xl font-bold text-gray-900">Company Details</h1>
          <p className="text-gray-600">Manage your company information</p>
        </div>
        <Button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
        >
          {editing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={company.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={company.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={company.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={company.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!editing}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={company.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!editing}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Legal & Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Legal & Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                value={company.gstin}
                onChange={(e) => handleInputChange('gstin', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                value={company.pan}
                onChange={(e) => handleInputChange('pan', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={company.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="logo">Company Logo</Label>
              <div className="flex items-center space-x-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={!editing}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo')?.click()}
                  disabled={!editing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                {company.logo && (
                  <img
                    src={company.logo}
                    alt="Company Logo"
                    className="h-10 w-10 object-contain"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card>
          <CardHeader>
            <CardTitle>Support Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={company.supportEmail}
                onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                value={company.supportPhone}
                onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                value={company.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                disabled={!editing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="https://facebook.com/yourpage"
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                placeholder="https://twitter.com/yourhandle"
                disabled={!editing}
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="https://instagram.com/yourhandle"
                disabled={!editing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}