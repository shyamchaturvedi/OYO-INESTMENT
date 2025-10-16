import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { logSecurityEvent } from './security';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export interface BackgroundProcessConfig {
  name: string;
  schedule: string;
  enabled: boolean;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ProcessResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  executionTime: number;
}

export class BackgroundProcessManager {
  private processes: Map<string, cron.ScheduledTask> = new Map();
  private io?: Server;
  private isRunning = false;

  constructor(io?: Server) {
    this.io = io;
  }

  /**
   * Register a background process
   */
  registerProcess(config: BackgroundProcessConfig, task: () => Promise<ProcessResult>) {
    if (this.processes.has(config.name)) {
      console.warn(`Process ${config.name} is already registered`);
      return;
    }

    const cronTask = cron.schedule(config.schedule, async () => {
      if (!config.enabled) {
        console.log(`Process ${config.name} is disabled, skipping execution`);
        return;
      }

      await this.executeProcess(config, task);
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata'
    });

    this.processes.set(config.name, cronTask);
    console.log(`✅ Registered background process: ${config.name} (${config.schedule})`);
  }

  /**
   * Execute a process with error handling and retry logic
   */
  private async executeProcess(config: BackgroundProcessConfig, task: () => Promise<ProcessResult>) {
    const startTime = Date.now();
    let lastError: Error | null = null;
    const retryAttempts = config.retryAttempts || 3;
    const retryDelay = config.retryDelay || 5000;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`🔄 Executing process: ${config.name} (attempt ${attempt}/${retryAttempts})`);
        
        const result = await Promise.race([
          task(),
          new Promise<ProcessResult>((_, reject) => 
            setTimeout(() => reject(new Error('Process timeout')), config.timeout || 300000)
          )
        ]);

        const executionTime = Date.now() - startTime;
        result.executionTime = executionTime;

        if (result.success) {
          console.log(`✅ Process ${config.name} completed successfully in ${executionTime}ms`);
          await this.logProcessResult(config.name, result);
          this.notifyProcessComplete(config.name, result);
          return;
        } else {
          throw new Error(result.error || 'Process failed');
        }

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Process ${config.name} failed (attempt ${attempt}/${retryAttempts}):`, error);

        if (attempt < retryAttempts) {
          console.log(`⏳ Retrying ${config.name} in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // All retry attempts failed
    const executionTime = Date.now() - startTime;
    const result: ProcessResult = {
      success: false,
      message: `Process failed after ${retryAttempts} attempts`,
      error: lastError?.message || 'Unknown error',
      executionTime
    };

    await this.logProcessResult(config.name, result);
    this.notifyProcessError(config.name, result);
  }

  /**
   * Start all registered processes
   */
  start() {
    if (this.isRunning) {
      console.warn('Background process manager is already running');
      return;
    }

    console.log('🚀 Starting background process manager...');
    
    for (const [name, task] of this.processes) {
      task.start();
      console.log(`▶️  Started process: ${name}`);
    }

    this.isRunning = true;
    console.log('✅ Background process manager started successfully');
  }

  /**
   * Stop all processes
   */
  stop() {
    if (!this.isRunning) {
      console.warn('Background process manager is not running');
      return;
    }

    console.log('🛑 Stopping background process manager...');
    
    for (const [name, task] of this.processes) {
      task.stop();
      console.log(`⏹️  Stopped process: ${name}`);
    }

    this.isRunning = false;
    console.log('✅ Background process manager stopped');
  }

  /**
   * Get status of all processes
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      processes: Array.from(this.processes.keys()).map(name => ({
        name,
        running: this.processes.get(name)?.getStatus() === 'scheduled'
      }))
    };
    return status;
  }

  /**
   * Log process result to database
   */
  private async logProcessResult(processName: string, result: ProcessResult) {
    try {
      await prisma.systemSettings.create({
        data: {
          key: `process_log_${processName}_${Date.now()}`,
          value: JSON.stringify({
            processName,
            success: result.success,
            message: result.message,
            error: result.error,
            executionTime: result.executionTime,
            timestamp: new Date().toISOString(),
            data: result.data
          }),
          description: `Background process execution log for ${processName}`
        }
      });
    } catch (error) {
      console.error('Failed to log process result:', error);
    }
  }

  /**
   * Notify via Socket.IO when process completes
   */
  private notifyProcessComplete(processName: string, result: ProcessResult) {
    if (this.io) {
      this.io.to('admin-room').emit('background-process-complete', {
        processName,
        result,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Notify via Socket.IO when process fails
   */
  private notifyProcessError(processName: string, result: ProcessResult) {
    if (this.io) {
      this.io.to('admin-room').emit('background-process-error', {
        processName,
        result,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Cleanup old process logs
   */
  async cleanupOldLogs(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

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
      return { success: true, deletedCount: deleted.count };
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const backgroundProcessManager = new BackgroundProcessManager();