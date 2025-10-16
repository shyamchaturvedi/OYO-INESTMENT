import { PrismaClient } from '@prisma/client';
import { logSecurityEvent } from '../security';
import { ProcessResult } from '../background-processes';

const prisma = new PrismaClient();

export async function checkSystemHealth(): Promise<ProcessResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Checking system health...');
    
    const healthChecks = {
      database: await checkDatabaseHealth(),
      diskSpace: await checkDiskSpace(),
      memoryUsage: await checkMemoryUsage(),
      activeUsers: await checkActiveUsers(),
      pendingTransactions: await checkPendingTransactions(),
      systemLoad: await checkSystemLoad()
    };

    const overallHealth = calculateOverallHealth(healthChecks);
    const issues = identifyIssues(healthChecks);

    // Log health check results
    await logSecurityEvent('SYSTEM_HEALTH_CHECK', {
      overallHealth,
      checks: healthChecks,
      issues,
      timestamp: new Date().toISOString()
    });

    // Store health check results
    await prisma.systemSettings.create({
      data: {
        key: `health_check_${Date.now()}`,
        value: JSON.stringify({
          overallHealth,
          checks: healthChecks,
          issues,
          timestamp: new Date().toISOString()
        }),
        description: 'System health check results'
      }
    });

    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      message: `System health check completed. Status: ${overallHealth}`,
      data: {
        overallHealth,
        checks: healthChecks,
        issues,
        executionTime
      },
      executionTime
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Error in system health check:', error);
    
    await logSecurityEvent('SYSTEM_HEALTH_CHECK_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      executionTime
    });

    return {
      success: false,
      message: 'System health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    };
  }
}

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime,
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database connection failed'
    };
  }
}

async function checkDiskSpace() {
  try {
    const fs = require('fs');
    const stats = fs.statSync('.');
    const freeSpace = require('os').freemem();
    const totalSpace = require('os').totalmem();
    const usedSpace = totalSpace - freeSpace;
    const usagePercentage = (usedSpace / totalSpace) * 100;
    
    return {
      status: usagePercentage > 90 ? 'critical' : usagePercentage > 80 ? 'warning' : 'healthy',
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      freeSpace: Math.round(freeSpace / 1024 / 1024 / 1024 * 100) / 100, // GB
      totalSpace: Math.round(totalSpace / 1024 / 1024 / 1024 * 100) / 100, // GB
      message: `Disk usage: ${Math.round(usagePercentage * 100) / 100}%`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check disk space'
    };
  }
}

async function checkMemoryUsage() {
  try {
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const usedMemory = memUsage.heapUsed;
    const usagePercentage = (usedMemory / totalMemory) * 100;
    
    return {
      status: usagePercentage > 90 ? 'critical' : usagePercentage > 80 ? 'warning' : 'healthy',
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      heapUsed: Math.round(usedMemory / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      message: `Memory usage: ${Math.round(usagePercentage * 100) / 100}%`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check memory usage'
    };
  }
}

async function checkActiveUsers() {
  try {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: {
          gte: last24Hours
        }
      }
    });
    
    const totalUsers = await prisma.user.count();
    const activePercentage = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    
    return {
      status: activePercentage > 10 ? 'healthy' : activePercentage > 5 ? 'warning' : 'critical',
      activeUsers,
      totalUsers,
      activePercentage: Math.round(activePercentage * 100) / 100,
      message: `${activeUsers} active users in last 24 hours`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check active users'
    };
  }
}

async function checkPendingTransactions() {
  try {
    const pendingCount = await prisma.transaction.count({
      where: {
        status: 'PENDING'
      }
    });
    
    const failedCount = await prisma.transaction.count({
      where: {
        status: 'FAILED'
      }
    });
    
    return {
      status: pendingCount > 100 ? 'critical' : pendingCount > 50 ? 'warning' : 'healthy',
      pendingCount,
      failedCount,
      message: `${pendingCount} pending transactions, ${failedCount} failed`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check pending transactions'
    };
  }
}

async function checkSystemLoad() {
  try {
    const loadAvg = require('os').loadavg();
    const cpuCount = require('os').cpus().length;
    const loadPercentage = (loadAvg[0] / cpuCount) * 100;
    
    return {
      status: loadPercentage > 90 ? 'critical' : loadPercentage > 70 ? 'warning' : 'healthy',
      loadAverage: loadAvg[0],
      cpuCount,
      loadPercentage: Math.round(loadPercentage * 100) / 100,
      message: `System load: ${Math.round(loadPercentage * 100) / 100}%`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check system load'
    };
  }
}

function calculateOverallHealth(checks: any) {
  const statuses = Object.values(checks).map((check: any) => check.status);
  
  if (statuses.includes('unhealthy')) return 'unhealthy';
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'healthy';
}

function identifyIssues(checks: any) {
  const issues: string[] = [];
  
  Object.entries(checks).forEach(([key, check]: [string, any]) => {
    if (check.status === 'unhealthy' || check.status === 'critical') {
      issues.push(`${key}: ${check.message}`);
    }
  });
  
  return issues;
}