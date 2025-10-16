import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { backgroundProcessManager } from '@/lib/background-processes';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const status = backgroundProcessManager.getStatus();
    
    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error fetching background process status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    switch (action) {
      case 'start':
        backgroundProcessManager.start();
        return NextResponse.json({
          success: true,
          message: 'Background processes started'
        });

      case 'stop':
        backgroundProcessManager.stop();
        return NextResponse.json({
          success: true,
          message: 'Background processes stopped'
        });

      case 'cleanup-logs':
        const result = await backgroundProcessManager.cleanupOldLogs();
        return NextResponse.json({
          success: result.success,
          message: result.success ? `Cleaned up ${result.deletedCount} old logs` : 'Failed to cleanup logs',
          data: result
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error controlling background processes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}