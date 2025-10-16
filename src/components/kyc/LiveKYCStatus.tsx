'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Upload, 
  Eye,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';

interface KYCStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUBMITTED';
  submittedAt: string;
  reviewedAt?: string;
  adminRemark?: string;
  documents: {
    aadharFront: boolean;
    aadharBack: boolean;
    panCard: boolean;
    bankDetails: boolean;
  };
}

interface LiveKYCStatusProps {
  userId: string;
  initialStatus?: KYCStatus;
}

export default function LiveKYCStatus({ userId, initialStatus }: LiveKYCStatusProps) {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(initialStatus || null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Join user's personal room for KYC updates
    socket.emit('join-user-room', userId);

    // Listen for KYC status updates
    socket.on('kyc-status-update', (data) => {
      console.log('KYC status update received:', data);
      setKycStatus(prev => ({
        ...prev,
        ...data,
        id: prev?.id || data.id
      }));
      setLastUpdate(new Date());
    });

    // Listen for connection status
    socket.on('connected', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('kyc-status-update');
      socket.off('connected');
      socket.off('disconnect');
    };
  }, [socket, userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'SUBMITTED':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'PENDING':
        return 'Under Review';
      case 'SUBMITTED':
        return 'Submitted';
      default:
        return 'Unknown';
    }
  };

  const getProgressPercentage = () => {
    if (!kycStatus) return 0;
    
    const documentCount = Object.values(kycStatus.documents).filter(Boolean).length;
    const totalDocuments = Object.keys(kycStatus.documents).length;
    
    return Math.round((documentCount / totalDocuments) * 100);
  };

  const refreshStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kyc/status');
      const data = await response.json();
      
      if (data.success) {
        setKycStatus(data.kyc);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to refresh KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!kycStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>KYC Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No KYC submission found. Please submit your KYC documents to get started.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live Updates Active' : 'Connecting...'}
          </span>
        </div>
        <button
          onClick={refreshStatus}
          disabled={isLoading}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(kycStatus.status)}
              <span>KYC Status</span>
            </CardTitle>
            <Badge className={getStatusColor(kycStatus.status)}>
              {getStatusText(kycStatus.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Document Completion</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Document Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${kycStatus.documents.aadharFront ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Aadhaar Front</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${kycStatus.documents.aadharBack ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Aadhaar Back</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${kycStatus.documents.panCard ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">PAN Card</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${kycStatus.documents.bankDetails ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Bank Details</span>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Submitted:</span>
              <span>{new Date(kycStatus.submittedAt).toLocaleString()}</span>
            </div>
            {kycStatus.reviewedAt && (
              <div className="flex justify-between">
                <span>Reviewed:</span>
                <span>{new Date(kycStatus.reviewedAt).toLocaleString()}</span>
              </div>
            )}
            {lastUpdate && (
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span>{lastUpdate.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Admin Remark */}
          {kycStatus.adminRemark && (
            <Alert className={kycStatus.status === 'REJECTED' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin Remark:</strong> {kycStatus.adminRemark}
              </AlertDescription>
            </Alert>
          )}

          {/* Status-specific messages */}
          {kycStatus.status === 'PENDING' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your KYC is currently under review. You will be notified once the review is complete.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus.status === 'APPROVED' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Congratulations! Your KYC has been approved. You can now access all features of the platform.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus.status === 'REJECTED' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Your KYC has been rejected. Please review the admin remark and resubmit with correct documents.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}