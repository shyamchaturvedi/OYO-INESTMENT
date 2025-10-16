import { BackgroundProcessManager, BackgroundProcessConfig } from '../background-processes';
import { distributeDailyROI } from './roi-distribution';
import { checkSystemHealth } from './system-health';
import { performDataCleanup } from './data-cleanup';
import { processNotifications } from './notification-processor';

export function initializeBackgroundProcesses(io?: any) {
  const processManager = new BackgroundProcessManager(io);

  // ROI Distribution - Daily at 12:00 AM IST
  processManager.registerProcess(
    {
      name: 'daily-roi-distribution',
      schedule: '0 0 * * *', // Every day at midnight
      enabled: true,
      timeout: 600000, // 10 minutes timeout
      retryAttempts: 3,
      retryDelay: 30000 // 30 seconds between retries
    },
    distributeDailyROI
  );

  // System Health Check - Every 15 minutes
  processManager.registerProcess(
    {
      name: 'system-health-check',
      schedule: '*/15 * * * *', // Every 15 minutes
      enabled: true,
      timeout: 120000, // 2 minutes timeout
      retryAttempts: 2,
      retryDelay: 10000 // 10 seconds between retries
    },
    checkSystemHealth
  );

  // Data Cleanup - Daily at 2:00 AM IST
  processManager.registerProcess(
    {
      name: 'data-cleanup',
      schedule: '0 2 * * *', // Every day at 2 AM
      enabled: true,
      timeout: 1800000, // 30 minutes timeout
      retryAttempts: 2,
      retryDelay: 60000 // 1 minute between retries
    },
    performDataCleanup
  );

  // Notification Processing - Every 5 minutes
  processManager.registerProcess(
    {
      name: 'notification-processor',
      schedule: '*/5 * * * *', // Every 5 minutes
      enabled: true,
      timeout: 300000, // 5 minutes timeout
      retryAttempts: 2,
      retryDelay: 15000 // 15 seconds between retries
    },
    processNotifications
  );

  // Weekly Report Generation - Every Sunday at 6:00 AM IST
  processManager.registerProcess(
    {
      name: 'weekly-report-generation',
      schedule: '0 6 * * 0', // Every Sunday at 6 AM
      enabled: true,
      timeout: 900000, // 15 minutes timeout
      retryAttempts: 2,
      retryDelay: 30000 // 30 seconds between retries
    },
    generateWeeklyReport
  );

  // Monthly Analytics - First day of every month at 3:00 AM IST
  processManager.registerProcess(
    {
      name: 'monthly-analytics',
      schedule: '0 3 1 * *', // First day of every month at 3 AM
      enabled: true,
      timeout: 1200000, // 20 minutes timeout
      retryAttempts: 2,
      retryDelay: 60000 // 1 minute between retries
    },
    generateMonthlyAnalytics
  );

  return processManager;
}

// Weekly Report Generation
async function generateWeeklyReport() {
  const { ProcessResult } = await import('../background-processes');
  const { PrismaClient } = await import('@prisma/client');
  const { logSecurityEvent } = await import('../security');
  
  const prisma = new PrismaClient();
  const startTime = Date.now();

  try {
    console.log('📊 Generating weekly report...');

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date();
    weekEnd.setHours(23, 59, 59, 999);

    // Get weekly statistics
    const stats = {
      newUsers: await prisma.user.count({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      }),
      totalInvestments: await prisma.investment.count({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      }),
      totalInvestmentAmount: await prisma.investment.aggregate({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        _sum: {
          amount: true
        }
      }),
      totalROIDistributed: await prisma.transaction.aggregate({
        where: {
          type: 'ROI',
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        _sum: {
          amount: true
        }
      }),
      totalWithdrawals: await prisma.withdrawal.aggregate({
        where: {
          createdAt: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        _sum: {
          amount: true
        }
      })
    };

    // Store weekly report
    await prisma.systemSettings.create({
      data: {
        key: `weekly_report_${weekStart.toISOString().split('T')[0]}`,
        value: JSON.stringify({
          period: {
            start: weekStart.toISOString(),
            end: weekEnd.toISOString()
          },
          stats,
          generatedAt: new Date().toISOString()
        }),
        description: `Weekly report for ${weekStart.toISOString().split('T')[0]}`
      }
    });

    await logSecurityEvent('WEEKLY_REPORT_GENERATED', {
      stats,
      period: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString()
      }
    });

    const executionTime = Date.now() - startTime;
    console.log(`📊 Weekly report generated successfully in ${executionTime}ms`);

    return {
      success: true,
      message: 'Weekly report generated successfully',
      data: { stats, executionTime },
      executionTime
    } as ProcessResult;

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Error generating weekly report:', error);
    
    await logSecurityEvent('WEEKLY_REPORT_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    });

    return {
      success: false,
      message: 'Weekly report generation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    } as ProcessResult;
  } finally {
    await prisma.$disconnect();
  }
}

// Monthly Analytics
async function generateMonthlyAnalytics() {
  const { ProcessResult } = await import('../background-processes');
  const { PrismaClient } = await import('@prisma/client');
  const { logSecurityEvent } = await import('../security');
  
  const prisma = new PrismaClient();
  const startTime = Date.now();

  try {
    console.log('📈 Generating monthly analytics...');

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date();
    monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Get monthly analytics
    const analytics = {
      userGrowth: await prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }),
      investmentGrowth: await prisma.investment.aggregate({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      revenue: await prisma.transaction.aggregate({
        where: {
          type: 'ROI',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          amount: true
        }
      }),
      topPlans: await prisma.investment.groupBy({
        by: ['planId'],
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 5
      })
    };

    // Store monthly analytics
    await prisma.systemSettings.create({
      data: {
        key: `monthly_analytics_${monthStart.getFullYear()}_${monthStart.getMonth() + 1}`,
        value: JSON.stringify({
          period: {
            start: monthStart.toISOString(),
            end: monthEnd.toISOString()
          },
          analytics,
          generatedAt: new Date().toISOString()
        }),
        description: `Monthly analytics for ${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`
      }
    });

    await logSecurityEvent('MONTHLY_ANALYTICS_GENERATED', {
      analytics,
      period: {
        start: monthStart.toISOString(),
        end: monthEnd.toISOString()
      }
    });

    const executionTime = Date.now() - startTime;
    console.log(`📈 Monthly analytics generated successfully in ${executionTime}ms`);

    return {
      success: true,
      message: 'Monthly analytics generated successfully',
      data: { analytics, executionTime },
      executionTime
    } as ProcessResult;

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Error generating monthly analytics:', error);
    
    await logSecurityEvent('MONTHLY_ANALYTICS_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    });

    return {
      success: false,
      message: 'Monthly analytics generation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    } as ProcessResult;
  } finally {
    await prisma.$disconnect();
  }
}