import { PrismaClient } from '@prisma/client';
import { logSecurityEvent } from '../security';
import { ProcessResult } from '../background-processes';

const prisma = new PrismaClient();

export async function distributeDailyROI(): Promise<ProcessResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Starting automated daily ROI distribution...');
    await logSecurityEvent('AUTO_ROI_DISTRIBUTION_STARTED', {
      timestamp: new Date().toISOString()
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if ROI was already distributed today
    const existingDistribution = await prisma.systemSettings.findFirst({
      where: {
        key: `roi_distribution_${today.toISOString().split('T')[0]}`
      }
    });

    if (existingDistribution) {
      console.log('ℹ️  ROI already distributed today, skipping...');
      return {
        success: true,
        message: 'ROI already distributed today',
        data: { skipped: true },
        executionTime: Date.now() - startTime
      };
    }

    // Get all active investments that haven't received ROI today
    const activeInvestments = await prisma.investment.findMany({
      where: {
        status: 'ACTIVE',
        remainingDays: {
          gt: 0,
        },
        OR: [
          { lastROIDate: null },
          { lastROIDate: { lt: today } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            walletBalance: true,
            totalEarnings: true,
            email: true,
            fullName: true,
            referralCode: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${activeInvestments.length} active investments for ROI distribution`);

    let totalROIDistributed = 0;
    let investmentsProcessed = 0;
    let referralCommissions = 0;
    const failedInvestments: string[] = [];

    for (const investment of activeInvestments) {
      try {
        // Start transaction for this investment
        await prisma.$transaction(async (tx) => {
          // Update user's wallet balance and total earnings
          await tx.user.update({
            where: { id: investment.userId },
            data: {
              walletBalance: {
                increment: investment.dailyROI,
              },
              totalEarnings: {
                increment: investment.dailyROI,
              },
            },
          });

          // Create ROI history record
          await tx.rOIHistory.create({
            data: {
              investmentId: investment.id,
              userId: investment.userId,
              amount: investment.dailyROI,
              creditedAt: new Date(),
            },
          });

          // Create transaction record
          await tx.transaction.create({
            data: {
              userId: investment.userId,
              type: 'ROI',
              amount: investment.dailyROI,
              description: `Daily ROI - ${investment.plan?.name || 'Investment'}`,
              status: 'COMPLETED',
              referenceId: investment.id,
              metadata: JSON.stringify({
                planName: investment.plan?.name,
                investmentAmount: investment.amount,
                roiPercentage: (investment.dailyROI / investment.amount) * 100
              }),
            },
          });

          // Update investment
          const newRemainingDays = investment.remainingDays - 1;
          const newTotalEarned = investment.totalEarned + investment.dailyROI;

          await tx.investment.update({
            where: { id: investment.id },
            data: {
              remainingDays: newRemainingDays,
              totalEarned: newTotalEarned,
              lastROIDate: new Date(),
              status: newRemainingDays === 0 ? 'COMPLETED' : 'ACTIVE',
            },
          });

          // Process referral commissions
          if (investment.user.referralCode) {
            const commissionResult = await processReferralCommissions(
              tx, 
              investment.userId, 
              investment.dailyROI, 
              investment.id,
              investment.user.referralCode
            );
            referralCommissions += commissionResult.totalCommission;
          }

          // Create notification for ROI
          await tx.notification.create({
            data: {
              userId: investment.userId,
              title: 'Daily ROI Credited',
              message: `₹${investment.dailyROI} has been credited to your wallet as daily ROI from ${investment.plan?.name || 'your investment'}.`,
              type: 'ROI',
            },
          });
        });

        totalROIDistributed += investment.dailyROI;
        investmentsProcessed++;

        console.log(`✅ ROI credited: ₹${investment.dailyROI} to user ${investment.user.fullName} (${investment.user.email})`);

      } catch (error) {
        console.error(`❌ Error processing investment ${investment.id}:`, error);
        failedInvestments.push(investment.id);
        
        // Log failed ROI distribution
        await logSecurityEvent('AUTO_ROI_DISTRIBUTION_FAILED', {
          investmentId: investment.id,
          userId: investment.userId,
          amount: investment.dailyROI,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Create system record for today's distribution
    await prisma.systemSettings.create({
      data: {
        key: `roi_distribution_${today.toISOString().split('T')[0]}`,
        value: JSON.stringify({
          totalROIDistributed,
          investmentsProcessed,
          referralCommissions,
          failedInvestments,
          processedAt: new Date().toISOString(),
        }),
        description: `Daily ROI distribution for ${today.toISOString().split('T')[0]}`,
      },
    });

    const executionTime = Date.now() - startTime;
    console.log(`\n📊 ROI Distribution Summary:`);
    console.log(`- Investments processed: ${investmentsProcessed}`);
    console.log(`- Failed investments: ${failedInvestments.length}`);
    console.log(`- Total ROI distributed: ₹${totalROIDistributed}`);
    console.log(`- Total referral commissions: ₹${referralCommissions}`);
    console.log(`- Process completed in: ${executionTime}ms`);

    await logSecurityEvent('AUTO_ROI_DISTRIBUTION_COMPLETED', {
      totalROIDistributed,
      investmentsProcessed,
      referralCommissions,
      failedInvestments: failedInvestments.length,
      executionTime
    });

    return {
      success: true,
      message: 'Daily ROI distribution completed successfully',
      data: {
        investmentsProcessed,
        failedInvestments: failedInvestments.length,
        totalROIDistributed,
        referralCommissions,
        executionTime
      },
      executionTime
    };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Error in automated ROI distribution:', error);
    
    await logSecurityEvent('AUTO_ROI_DISTRIBUTION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      executionTime
    });

    return {
      success: false,
      message: 'Failed to distribute daily ROI',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    };
  }
}

async function processReferralCommissions(
  tx: any, 
  userId: string, 
  roiAmount: number, 
  investmentId: string,
  userReferralCode: string
): Promise<{ totalCommission: number }> {
  const commissionRates = [10, 5, 3, 2, 1]; // Percentage for each level
  let totalCommission = 0;
  let currentReferralCode = userReferralCode;

  for (let level = 0; level < 5; level++) {
    // Get the referrer for current level
    const referrer = await tx.user.findFirst({
      where: { referralCode: currentReferralCode },
      include: {
        referredUsers: true,
      },
    });

    if (!referrer) break;

    const commissionAmount = (roiAmount * commissionRates[level]) / 100;
    if (commissionAmount > 0) {
      // Update referrer's wallet and earnings
      await tx.user.update({
        where: { id: referrer.id },
        data: {
          walletBalance: {
            increment: commissionAmount,
          },
          totalEarnings: {
            increment: commissionAmount,
          },
        },
      });

      // Create referral commission record
      await tx.referralCommission.create({
        data: {
          userId: referrer.id,
          fromUserId: userId,
          investmentId: investmentId,
          level: level + 1,
          percentage: commissionRates[level],
          amount: commissionAmount,
        },
      });

      // Create transaction for commission
      await tx.transaction.create({
        data: {
          userId: referrer.id,
          type: 'REFERRAL',
          amount: commissionAmount,
          description: `Level ${level + 1} referral commission from ROI`,
          status: 'COMPLETED',
          referenceId: investmentId,
          metadata: JSON.stringify({
            level: level + 1,
            fromUserId: userId,
            roiAmount: roiAmount,
            commissionRate: commissionRates[level],
          }),
        },
      });

      // Create notification for referrer
      await tx.notification.create({
        data: {
          userId: referrer.id,
          title: 'Referral Commission Received',
          message: `₹${commissionAmount} has been credited as Level ${level + 1} referral commission.`,
          type: 'REFERRAL',
        },
      });

      totalCommission += commissionAmount;
      console.log(`💰 Level ${level + 1} commission: ₹${commissionAmount} to ${referrer.fullName}`);
    }

    currentReferralCode = referrer.referralCode || '';
  }

  return { totalCommission };
}