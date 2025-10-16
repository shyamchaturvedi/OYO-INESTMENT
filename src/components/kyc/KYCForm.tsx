'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface KYCFormData {
  aadharNumber: string
  panNumber: string
  nomineeName: string
  nomineeRelation: string
  declaration: boolean
  aadharFront: File | null
  aadharBack: File | null
  panCard: File | null
}

export default function KYCForm() {
  const [formData, setFormData] = useState<KYCFormData>({
    aadharNumber: '',
    panNumber: '',
    nomineeName: '',
    nomineeRelation: '',
    declaration: false,
    aadharFront: null,
    aadharBack: null,
    panCard: null
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({})

  const totalSteps = 3

  const onDropAadharFront = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData(prev => ({ ...prev, aadharFront: file }))
      setUploadedFiles(prev => ({ ...prev, aadharFront: file.name }))
    }
  }, [])

  const onDropAadharBack = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData(prev => ({ ...prev, aadharBack: file }))
      setUploadedFiles(prev => ({ ...prev, aadharBack: file.name }))
    }
  }, [])

  const onDropPanCard = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFormData(prev => ({ ...prev, panCard: file }))
      setUploadedFiles(prev => ({ ...prev, panCard: file.name }))
    }
  }, [])

  const {
    getRootProps: getAadharFrontProps,
    getInputProps: getAadharFrontInput,
    isDragActive: isAadharFrontActive
  } = useDropzone({
    onDrop: onDropAadharFront,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  })

  const {
    getRootProps: getAadharBackProps,
    getInputProps: getAadharBackInput,
    isDragActive: isAadharBackActive
  } = useDropzone({
    onDrop: onDropAadharBack,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  })

  const {
    getRootProps: getPanCardProps,
    getInputProps: getPanCardInput,
    isDragActive: isPanCardActive
  } = useDropzone({
    onDrop: onDropPanCard,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  })

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.aadharNumber.length === 12 && formData.panNumber.length === 10
      case 2:
        return formData.aadharFront && formData.aadharBack && formData.panCard
      case 3:
        return formData.nomineeName.length > 0 && 
               formData.nomineeRelation.length > 0 && 
               formData.declaration
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      toast.error('Please complete all required fields in this step')
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      
      // Add form fields
      formDataToSend.append('aadharNumber', formData.aadharNumber)
      formDataToSend.append('panNumber', formData.panNumber)
      formDataToSend.append('nomineeName', formData.nomineeName)
      formDataToSend.append('nomineeRelation', formData.nomineeRelation)
      formDataToSend.append('declaration', formData.declaration.toString())
      
      // Add files
      if (formData.aadharFront) formDataToSend.append('aadharFront', formData.aadharFront)
      if (formData.aadharBack) formDataToSend.append('aadharBack', formData.aadharBack)
      if (formData.panCard) formDataToSend.append('panCard', formData.panCard)

      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('KYC documents submitted successfully! Please wait for admin approval.')
        // Reset form or redirect
        setFormData({
          aadharNumber: '',
          panNumber: '',
          nomineeName: '',
          nomineeRelation: '',
          declaration: false,
          aadharFront: null,
          aadharBack: null,
          panCard: null
        })
        setUploadedFiles({})
        setCurrentStep(1)
      } else {
        toast.error(result.error || 'Failed to submit KYC documents')
      }
    } catch (error) {
      console.error('KYC submission error:', error)
      toast.error('Failed to submit KYC documents. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            KYC Verification - RBI Compliance
          </CardTitle>
          <CardDescription>
            Complete your KYC verification to continue withdrawals. As per RBI guidelines, 
            KYC is mandatory for cumulative withdrawals exceeding ₹500.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                    <Input
                      id="aadharNumber"
                      type="text"
                      placeholder="1234 5678 9012"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) 
                      }))}
                      maxLength={12}
                    />
                    {formData.aadharNumber.length === 12 && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      type="text"
                      placeholder="ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        panNumber: e.target.value.toUpperCase().slice(0, 10) 
                      }))}
                      maxLength={10}
                    />
                    {formData.panNumber.length === 10 && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please ensure your Aadhar and PAN numbers are correct and match your uploaded documents.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 2: Document Upload */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Document Upload</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Aadhar Front */}
                  <div className="space-y-2">
                    <Label>Aadhar Card (Front) *</Label>
                    <div
                      {...getAadharFrontProps()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        isAadharFrontActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                      } ${formData.aadharFront ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      <input {...getAadharFrontInput()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploadedFiles.aadharFront || 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                    </div>
                  </div>

                  {/* Aadhar Back */}
                  <div className="space-y-2">
                    <Label>Aadhar Card (Back) *</Label>
                    <div
                      {...getAadharBackProps()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        isAadharBackActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                      } ${formData.aadharBack ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      <input {...getAadharBackInput()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploadedFiles.aadharBack || 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                    </div>
                  </div>

                  {/* PAN Card */}
                  <div className="space-y-2">
                    <Label>PAN Card *</Label>
                    <div
                      {...getPanCardProps()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        isPanCardActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                      } ${formData.panCard ? 'border-green-500 bg-green-50' : ''}`}
                    >
                      <input {...getPanCardInput()} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploadedFiles.panCard || 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload clear, readable copies of your documents. Blurred or unclear documents will be rejected.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Step 3: Nominee & Declaration */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Nominee Information & Declaration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomineeName">Nominee Name *</Label>
                    <Input
                      id="nomineeName"
                      type="text"
                      placeholder="Enter nominee full name"
                      value={formData.nomineeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, nomineeName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomineeRelation">Relationship with Nominee *</Label>
                    <Select
                      value={formData.nomineeRelation}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, nomineeRelation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="son">Son</SelectItem>
                        <SelectItem value="daughter">Daughter</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="brother">Brother</SelectItem>
                        <SelectItem value="sister">Sister</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">RBI Compliance Declaration</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>I hereby declare that:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>All information provided is true and correct to the best of my knowledge</li>
                        <li>The documents uploaded are authentic and belong to me</li>
                        <li>I am not involved in any money laundering or terrorist financing activities</li>
                        <li>I understand that false information may lead to legal action</li>
                        <li>I comply with all RBI regulations and guidelines</li>
                        <li>The platform can verify my information with relevant authorities</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="declaration"
                      checked={formData.declaration}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, declaration: checked as boolean }))
                      }
                    />
                    <Label htmlFor="declaration" className="text-sm">
                      I have read and agree to the RBI compliance declaration and terms & conditions
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.declaration}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit KYC Documents'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}