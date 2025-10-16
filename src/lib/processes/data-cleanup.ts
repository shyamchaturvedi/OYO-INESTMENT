import { PrismaClient } from '@prisma/client';
import { logSecurityEvent } from '../security';
import { ProcessResult } from '../background-processes';

const prisma = new PrismaClient();

export async function performDataCleanup(): Promise<ProcessResult> {
  const startTime = Date.now();
  
  try {
    console.log('🧹 Starting data cleanup process...');
    
    const cleanupTasks = {
      oldLogs: await cleanupOldLogs(),
      expiredSessions: await cleanupExpiredSessions(),
      oldNotifications: await cleanupOldNotifications(),
      completedInvestments: await cleanupCompletedInvestments(),
      oldSystemSettings: await cleanupOldSystemSettings(),
      orphanedRecords: await cleanupOrphanedRecords()
    };

    const totalCleaned = Object.values(cleanupTasks).reduce((sum, task) => sum + (task.count || 0), 0);

    // Log cleanup results
    await logSecurityEvent('DATA_CLEANUP_COMPLETED', {
      tasks: cleanupTasks,
      totalCleaned,
      timestamp: new Date().toISOString()
    });

    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      message: `Data cleanup completed. Cleaned ${totalCleaned} records.`,
      data: {
        tasks: cleanupTasks,
        totalCleaned,
        executionTime
      },
      executionTime
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Error in data cleanup:', error);
    
    await logSecurityEvent('DATA_CLEANUP_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      executionTime
    });

    return {
      success: false,
      message: 'Data cleanup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    };
  }
}

async function cleanupOldLogs() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep logs for 30 days

    const deleted = await prisma.systemSettings.deleteMany({
      where: {
        key: {
          startsWith: 'process_log_'
        },
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🧹 Cleaned up ${deleted.count} old process logs`);
    return { success: true, count: deleted.count, message: `Cleaned ${deleted.count} old logs` };
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function cleanupExpiredSessions() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24); // Sessions older than 24 hours

    // Note: This assumes you have a sessions table. Adjust based on your auth implementation
    const deleted = await prisma.systemSettings.deleteMany({
      where: {
        key: {
          startsWith: 'session_'
        },
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🧹 Cleaned up ${deleted.count} expired sessions`);
    return { success: true, count: deleted.count, message: `Cleaned ${deleted.count} expired sessions` };
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function cleanupOldNotifications() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep notifications for 90 days

    const deleted = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        type: {
          in: ['SYSTEM', 'INFO'] // Only cleanup system and info notifications
        }
      }
    });

    console.log(`🧹 Cleaned up ${deleted.count} old notifications`);
    return { success: true, count: deleted.count, message: `Cleaned ${deleted.count} old notifications` };
  } catch (error) {
    console.error('Failed to cleanup old notifications:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function cleanupCompletedInvestments() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365); // Keep completed investments for 1 year

    // Archive completed investments older than 1 year
    const completedInvestments = await prisma.investment.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          lt: cutoffDate
        }
      },
      select: {
        id: true,
        userId: true,
        amount: true,
        totalEarned: true,
        planId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (completedInvestments.length > 0) {
      // Create archive records
      await prisma.systemSettings.createMany({
        data: completedInvestments.map(investment => ({
          key: `archived_investment_${investment.id}`,
          value: JSON.stringify(investment),
          description: `Archived completed investment from ${investment.createdAt.toISOString()}`
        }))
      });

      // Delete the original records
      const deleted = await prisma.investment.deleteMany({
        where: {
          id: {
            in: completedInvestments.map(inv => inv.id)
          }
        }
      });

      console.log(`🧹 Archived and cleaned up ${deleted.count} old completed investments`);
      return { success: true, count: deleted.count, message: `Archived ${deleted.count} old investments` };
    }

    return { success: true, count: 0, message: 'No old completed investments to clean up' };
  } catch (error) {
    console.error('Failed to cleanup completed investments:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function cleanupOldSystemSettings() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 180); // Keep system settings for 6 months

    const deleted = await prisma.systemSettings.deleteMany({
      where: {
        key: {
          startsWith: 'health_check_'
        },
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🧹 Cleaned up ${deleted.count} old system settings`);
    return { success: true, count: deleted.count, message: `Cleaned ${deleted.count} old system settings` };
  } catch (error) {
    console.error('Failed to cleanup old system settings:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function cleanupOrphanedRecords() {
  try {
    let totalCleaned = 0;

    // Cleanup orphaned ROI history records
    const orphanedROI = await prisma.rOIHistory.deleteMany({
      where: {
        investment: null
      }
    });
    totalCleaned += orphanedROI.count;

    // Cleanup orphaned referral commissions
    const orphanedCommissions = await prisma.referralCommission.deleteMany({
      where: {
        OR: [
          { user: null },
          { fromUser: null },
          { investment: null }
        ]
      }
    });
    totalCleaned += orphanedCommissions.count;

    // Cleanup orphaned transactions
    const orphanedTransactions = await prisma.transaction.deleteMany({
      where: {
        user: null
      }
    });
    totalCleaned += orphanedTransactions.count;

    // Cleanup orphaned notifications
    const orphanedNotifications = await prisma.notification.deleteMany({
      where: {
        user: null
      }
    });
    totalCleaned += orphanedNotifications.count;

    console.log(`🧹 Cleaned up ${totalCleaned} orphaned records`);
    return { success: true, count: totalCleaned, message: `Cleaned ${totalCleaned} orphaned records` };
  } catch (error) {
    console.error('Failed to cleanup orphaned records:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}