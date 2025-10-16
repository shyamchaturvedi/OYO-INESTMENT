'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';
import { useToast } from '@/hooks/use-toast';

interface KYCFormData {
  aadharFront: File | null;
  aadharBack: File | null;
  panCard: string;
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  upiId: string;
}

interface LiveKYCFormProps {
  onSubmitted?: () => void;
}

export default function LiveKYCForm({ onSubmitted }: LiveKYCFormProps) {
  const [formData, setFormData] = useState<KYCFormData>({
    aadharFront: null,
    aadharBack: null,
    panCard: '',
    bankDetails: {
      accountNumber: '',
      ifsc: '',
      bankName: ''
    },
    upiId: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  
  const socket = useSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    socket.on('connected', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for KYC submission updates
    socket.on('kyc-submission-update', (data) => {
      console.log('KYC submission update:', data);
      if (data.status === 'success') {
        toast({
          title: 'KYC Submitted Successfully',
          description: 'Your KYC documents have been submitted and are under review.',
        });
        setCurrentStep(4); // Success step
      } else if (data.status === 'error') {
        toast({
          title: 'Submission Failed',
          description: data.message || 'Please try again.',
          variant: 'destructive'
        });
        setIsSubmitting(false);
      }
    });

    return () => {
      socket.off('connected');
      socket.off('disconnect');
      socket.off('kyc-submission-update');
    };
  }, [socket, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.aadharFront) {
      newErrors.aadharFront = 'Aadhaar front image is required';
    }
    if (!formData.aadharBack) {
      newErrors.aadharBack = 'Aadhaar back image is required';
    }
    if (!formData.panCard) {
      newErrors.panCard = 'PAN card number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panCard)) {
      newErrors.panCard = 'Invalid PAN card format';
    }
    if (!formData.bankDetails.accountNumber) {
      newErrors.accountNumber = 'Bank account number is required';
    }
    if (!formData.bankDetails.ifsc) {
      newErrors.ifsc = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifsc)) {
      newErrors.ifsc = 'Invalid IFSC code format';
    }
    if (!formData.bankDetails.bankName) {
      newErrors.bankName = 'Bank name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (field: 'aadharFront' | 'aadharBack', file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [field]: 'Please upload an image file' }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('aadharFront', formData.aadharFront!);
      formDataToSend.append('aadharBack', formData.aadharBack!);
      formDataToSend.append('panCard', formData.panCard);
      formDataToSend.append('bankDetails', JSON.stringify(formData.bankDetails));
      formDataToSend.append('upiId', formData.upiId);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (data.success) {
        // Emit real-time update
        if (socket) {
          socket.emit('kyc-update', {
            userId: data.userId,
            status: 'SUBMITTED',
            kycId: data.kycId
          });
        }
        
        setCurrentStep(4);
        toast({
          title: 'KYC Submitted Successfully',
          description: 'Your documents are under review. You will be notified of the status.',
        });
        
        // Call the callback if provided
        if (onSubmitted) {
          onSubmitted();
        }
      } else {
        throw new Error(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live Updates Active' : 'Connecting...'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Step {currentStep} of 3
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={getStepProgress()} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Documents</span>
          <span>Details</span>
          <span>Review</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>KYC Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Document Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Upload Documents</h3>
                
                {/* Aadhaar Front */}
                <div className="space-y-2">
                  <Label htmlFor="aadharFront">Aadhaar Card Front *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      id="aadharFront"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('aadharFront', e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="aadharFront" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        {formData.aadharFront ? formData.aadharFront.name : 'Click to upload Aadhaar front'}
                      </span>
                    </label>
                    {errors.aadharFront && (
                      <p className="text-sm text-red-500 mt-1">{errors.aadharFront}</p>
                    )}
                  </div>
                </div>

                {/* Aadhaar Back */}
                <div className="space-y-2">
                  <Label htmlFor="aadharBack">Aadhaar Card Back *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <input
                      type="file"
                      id="aadharBack"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('aadharBack', e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="aadharBack" className="cursor-pointer">
                      <span className="text-sm text-gray-600">
                        {formData.aadharBack ? formData.aadharBack.name : 'Click to upload Aadhaar back'}
                      </span>
                    </label>
                    {errors.aadharBack && (
                      <p className="text-sm text-red-500 mt-1">{errors.aadharBack}</p>
                    )}
                  </div>
                </div>

                <Button type="button" onClick={nextStep} className="w-full">
                  Next: Personal Details
                </Button>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Personal Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="panCard">PAN Card Number *</Label>
                  <Input
                    id="panCard"
                    value={formData.panCard}
                    onChange={(e) => setFormData(prev => ({ ...prev, panCard: e.target.value.toUpperCase() }))}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                  {errors.panCard && (
                    <p className="text-sm text-red-500">{errors.panCard}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Bank Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                    }))}
                    placeholder="Enter your bank account number"
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-red-500">{errors.accountNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code *</Label>
                  <Input
                    id="ifsc"
                    value={formData.bankDetails.ifsc}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      bankDetails: { ...prev.bankDetails, ifsc: e.target.value.toUpperCase() }
                    }))}
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                  {errors.ifsc && (
                    <p className="text-sm text-red-500">{errors.ifsc}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                    }))}
                    placeholder="Enter your bank name"
                  />
                  {errors.bankName && (
                    <p className="text-sm text-red-500">{errors.bankName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID (Optional)</Label>
                  <Input
                    id="upiId"
                    value={formData.upiId}
                    onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                    placeholder="yourname@paytm"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep} className="flex-1">
                    Next: Review
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Review & Submit</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Aadhaar Front</Label>
                      <p className="text-sm text-gray-600">
                        {formData.aadharFront ? formData.aadharFront.name : 'Not uploaded'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Aadhaar Back</Label>
                      <p className="text-sm text-gray-600">
                        {formData.aadharBack ? formData.aadharBack.name : 'Not uploaded'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">PAN Card</Label>
                    <p className="text-sm text-gray-600">{formData.panCard || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Bank Details</Label>
                    <p className="text-sm text-gray-600">
                      {formData.bankDetails.accountNumber} - {formData.bankDetails.bankName}
                    </p>
                    <p className="text-sm text-gray-600">IFSC: {formData.bankDetails.ifsc}</p>
                  </div>
                  
                  {formData.upiId && (
                    <div>
                      <Label className="text-sm font-medium">UPI ID</Label>
                      <p className="text-sm text-gray-600">{formData.upiId}</p>
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please review all information carefully. Once submitted, you cannot modify the details.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                    Previous
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit KYC'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {currentStep === 4 && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-medium text-green-800">KYC Submitted Successfully!</h3>
                <p className="text-gray-600">
                  Your KYC documents have been submitted and are under review. 
                  You will be notified of the status via email and in-app notifications.
                </p>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Submit Another KYC
                </Button>
              </div>
            )}
          </form>

          {/* Upload Progress */}
          {isSubmitting && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading documents...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}