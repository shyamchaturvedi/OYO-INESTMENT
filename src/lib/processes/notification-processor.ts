import { PrismaClient } from '@prisma/client';
import { logSecurityEvent } from '../security';
import { ProcessResult } from '../background-processes';

const prisma = new PrismaClient();

export async function processNotifications(): Promise<ProcessResult> {
  const startTime = Date.now();
  
  try {
    console.log('📧 Processing pending notifications...');
    
    const tasks = {
      sendEmailNotifications: await sendEmailNotifications(),
      sendSMSNotifications: await sendSMSNotifications(),
      processSystemNotifications: await processSystemNotifications(),
      cleanupSentNotifications: await cleanupSentNotifications()
    };

    const totalProcessed = Object.values(tasks).reduce((sum, task) => sum + (task.count || 0), 0);

    // Log notification processing results
    await logSecurityEvent('NOTIFICATION_PROCESSING_COMPLETED', {
      tasks,
      totalProcessed,
      timestamp: new Date().toISOString()
    });

    const executionTime = Date.now() - startTime;
    
    return {
      success: true,
      message: `Notification processing completed. Processed ${totalProcessed} notifications.`,
      data: {
        tasks,
        totalProcessed,
        executionTime
      },
      executionTime
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Error in notification processing:', error);
    
    await logSecurityEvent('NOTIFICATION_PROCESSING_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      executionTime
    });

    return {
      success: false,
      message: 'Notification processing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    };
  }
}

async function sendEmailNotifications() {
  try {
    // Get pending email notifications
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        type: 'EMAIL',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true
          }
        }
      },
      take: 50 // Process in batches
    });

    let processedCount = 0;
    const failedNotifications: string[] = [];

    for (const notification of pendingNotifications) {
      try {
        // Simulate email sending (replace with actual email service)
        const emailSent = await sendEmail({
          to: notification.user.email,
          subject: notification.title,
          body: notification.message,
          template: notification.metadata ? JSON.parse(notification.metadata).template : 'default'
        });

        if (emailSent) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              sentAt: new Date()
            }
          });
          processedCount++;
        } else {
          throw new Error('Email sending failed');
        }
      } catch (error) {
        console.error(`Failed to send email notification ${notification.id}:`, error);
        failedNotifications.push(notification.id);
        
        // Mark as failed after 3 attempts
        const attempts = notification.metadata ? JSON.parse(notification.metadata).attempts || 0 : 0;
        if (attempts >= 3) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'FAILED',
              metadata: JSON.stringify({ attempts: attempts + 1, error: error instanceof Error ? error.message : 'Unknown error' })
            }
          });
        } else {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              metadata: JSON.stringify({ attempts: attempts + 1, error: error instanceof Error ? error.message : 'Unknown error' })
            }
          });
        }
      }
    }

    console.log(`📧 Processed ${processedCount} email notifications, ${failedNotifications.length} failed`);
    return { success: true, count: processedCount, failed: failedNotifications.length, message: `Processed ${processedCount} emails` };
  } catch (error) {
    console.error('Failed to process email notifications:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendSMSNotifications() {
  try {
    // Get pending SMS notifications
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        type: 'SMS',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            phone: true,
            fullName: true
          }
        }
      },
      take: 20 // Process SMS in smaller batches
    });

    let processedCount = 0;
    const failedNotifications: string[] = [];

    for (const notification of pendingNotifications) {
      try {
        // Simulate SMS sending (replace with actual SMS service)
        const smsSent = await sendSMS({
          to: notification.user.phone,
          message: notification.message
        });

        if (smsSent) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'SENT',
              sentAt: new Date()
            }
          });
          processedCount++;
        } else {
          throw new Error('SMS sending failed');
        }
      } catch (error) {
        console.error(`Failed to send SMS notification ${notification.id}:`, error);
        failedNotifications.push(notification.id);
        
        // Mark as failed after 2 attempts
        const attempts = notification.metadata ? JSON.parse(notification.metadata).attempts || 0 : 0;
        if (attempts >= 2) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: 'FAILED',
              metadata: JSON.stringify({ attempts: attempts + 1, error: error instanceof Error ? error.message : 'Unknown error' })
            }
          });
        } else {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              metadata: JSON.stringify({ attempts: attempts + 1, error: error instanceof Error ? error.message : 'Unknown error' })
            }
          });
        }
      }
    }

    console.log(`📱 Processed ${processedCount} SMS notifications, ${failedNotifications.length} failed`);
    return { success: true, count: processedCount, failed: failedNotifications.length, message: `Processed ${processedCount} SMS` };
  } catch (error) {
    console.error('Failed to process SMS notifications:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function processSystemNotifications() {
  try {
    // Get system notifications that need to be sent to all users
    const systemNotifications = await prisma.notification.findMany({
      where: {
        type: 'SYSTEM',
        status: 'PENDING'
      },
      take: 10
    });

    let processedCount = 0;

    for (const notification of systemNotifications) {
      try {
        // Get all active users
        const activeUsers = await prisma.user.findMany({
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true
          }
        });

        // Create individual notifications for each user
        const userNotifications = activeUsers.map(user => ({
          userId: user.id,
          title: notification.title,
          message: notification.message,
          type: 'INFO',
          status: 'PENDING' as const,
          metadata: notification.metadata
        }));

        await prisma.notification.createMany({
          data: userNotifications
        });

        // Mark system notification as processed
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        });

        processedCount += userNotifications.length;
      } catch (error) {
        console.error(`Failed to process system notification ${notification.id}:`, error);
      }
    }

    console.log(`🔔 Processed ${processedCount} system notifications`);
    return { success: true, count: processedCount, message: `Processed ${processedCount} system notifications` };
  } catch (error) {
    console.error('Failed to process system notifications:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function cleanupSentNotifications() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep sent notifications for 7 days

    const deleted = await prisma.notification.deleteMany({
      where: {
        status: 'SENT',
        sentAt: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🧹 Cleaned up ${deleted.count} old sent notifications`);
    return { success: true, count: deleted.count, message: `Cleaned ${deleted.count} old notifications` };
  } catch (error) {
    console.error('Failed to cleanup sent notifications:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Placeholder functions for email and SMS sending
async function sendEmail({ to, subject, body, template }: { to: string; subject: string; body: string; template?: string }): Promise<boolean> {
  // TODO: Implement actual email sending service (SendGrid, AWS SES, etc.)
  console.log(`📧 Email to ${to}: ${subject}`);
  console.log(`Body: ${body}`);
  
  // Simulate email sending
  return Math.random() > 0.1; // 90% success rate for simulation
}

async function sendSMS({ to, message }: { to: string; message: string }): Promise<boolean> {
  // TODO: Implement actual SMS sending service (Twilio, AWS SNS, etc.)
  console.log(`📱 SMS to ${to}: ${message}`);
  
  // Simulate SMS sending
  return Math.random() > 0.2; // 80% success rate for simulation
}