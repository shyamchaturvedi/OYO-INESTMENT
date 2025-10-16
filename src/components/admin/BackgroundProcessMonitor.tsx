'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Play, Square, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcessStatus {
  isRunning: boolean;
  processes: Array<{
    name: string;
    running: boolean;
  }>;
}

export default function BackgroundProcessMonitor() {
  const [status, setStatus] = useState<ProcessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/background-processes');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch background process status',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch background process status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const response = await fetch('/api/admin/background-processes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: data.message
        });
        await fetchStatus();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Action failed',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error performing action:', error);
      toast({
        title: 'Error',
        description: 'Action failed',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Background Processes</CardTitle>
          <CardDescription>Loading process status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Background Process Manager</CardTitle>
              <CardDescription>
                Monitor and control automated background processes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStatus}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {status?.isRunning ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAction('stop')}
                  disabled={actionLoading === 'stop'}
                >
                  <Square className="h-4 w-4 mr-2" />
                  {actionLoading === 'stop' ? 'Stopping...' : 'Stop All'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAction('start')}
                  disabled={actionLoading === 'start'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {actionLoading === 'start' ? 'Starting...' : 'Start All'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {status?.isRunning ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                Manager Status: {status?.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <Badge variant={status?.isRunning ? 'default' : 'destructive'}>
              {status?.isRunning ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {status?.processes.map((process) => (
          <Card key={process.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {process.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  {process.running ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Badge variant={process.running ? 'default' : 'secondary'}>
                  {process.running ? 'Running' : 'Scheduled'}
                </Badge>
                <div className="text-xs text-gray-500">
                  {getProcessDescription(process.name)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Actions</CardTitle>
          <CardDescription>
            Perform maintenance tasks and cleanup operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('cleanup-logs')}
              disabled={actionLoading === 'cleanup-logs'}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {actionLoading === 'cleanup-logs' ? 'Cleaning...' : 'Cleanup Old Logs'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Background processes run automatically according to their schedules. 
          The ROI distribution runs daily at midnight, health checks every 15 minutes, 
          and data cleanup daily at 2 AM. You can start/stop the entire system or 
          perform manual maintenance tasks as needed.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function getProcessDescription(processName: string): string {
  const descriptions: Record<string, string> = {
    'daily-roi-distribution': 'Daily at 12:00 AM',
    'system-health-check': 'Every 15 minutes',
    'data-cleanup': 'Daily at 2:00 AM',
    'notification-processor': 'Every 5 minutes',
    'weekly-report-generation': 'Sundays at 6:00 AM',
    'monthly-analytics': '1st of month at 3:00 AM'
  };
  
  return descriptions[processName] || 'Scheduled process';
}