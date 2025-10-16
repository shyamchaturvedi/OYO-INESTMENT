const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupInitialData() {
  try {
    console.log('Setting up initial data...');

    // 1. Create Admin User
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        fullName: 'Admin User',
        email: 'admin@poweroyo.com',
        mobile: '7777777777',
        password: hashedAdminPassword,
        referralCode: 'ADMIN0001',
        role: 'ADMIN',
        status: 'ACTIVE',
        walletBalance: 0,
        totalEarnings: 0,
      }
    });
    console.log('✅ Admin user created');

    // 2. Create Company Details
    const company = await prisma.companyDetails.create({
      data: {
        name: 'PowerOYO Investment Platform',
        email: 'support@poweroyo.com',
        phone: '+91-9876543210',
        address: '123 Business Hub, Mumbai, Maharashtra 400001',
        description: 'India\'s most trusted investment platform with daily returns and 5-level referral income.',
        supportEmail: 'support@poweroyo.com',
        supportPhone: '+91-9876543210',
        website: 'https://poweroyo.com',
      }
    });
    console.log('✅ Company details created');

    // 3. Create Commission Settings (5-level)
    const commissionLevels = [
      { level: 1, percentage: 10, description: 'Level 1 - Direct Referral' },
      { level: 2, percentage: 5, description: 'Level 2 - Indirect Referral' },
      { level: 3, percentage: 3, description: 'Level 3 - Indirect Referral' },
      { level: 4, percentage: 2, description: 'Level 4 - Indirect Referral' },
      { level: 5, percentage: 1, description: 'Level 5 - Indirect Referral' },
    ];

    for (const level of commissionLevels) {
      await prisma.commissionSettings.create({ data: level });
    }
    console.log('✅ Commission settings created');

    // 4. Create UPI Payment Methods
    const upiMethods = [
      { upiId: 'poweroyo@ybl', displayName: 'PowerOYO Paytm', isDefault: true },
      { upiId: 'poweroyo@okicici', displayName: 'PowerOYO ICICI' },
      { upiId: 'poweroyo@okhdfc', displayName: 'PowerOYO HDFC' },
    ];

    for (const upi of upiMethods) {
      await prisma.uPIPayment.create({ data: upi });
    }
    console.log('✅ UPI payment methods created');

    // 5. Create Investment Plans
    const plans = [
      {
        name: 'Basic Plan',
        amount: 50,
        dailyROI: 7.5,
        duration: 30,
        description: 'Perfect for beginners - Start with just ₹50 and earn 15% daily returns.',
        status: 'ACTIVE'
      },
      {
        name: 'Standard Plan',
        amount: 100,
        dailyROI: 15,
        duration: 30,
        description: 'Most popular choice - Double your investment in just 20 days.',
        status: 'ACTIVE'
      },
      {
        name: 'Premium Plan',
        amount: 200,
        dailyROI: 30,
        duration: 30,
        description: 'Maximum returns - Earn ₹30 daily for 30 days.',
        status: 'ACTIVE'
      },
      {
        name: 'Gold Plan',
        amount: 500,
        dailyROI: 75,
        duration: 30,
        description: 'High value investment - Best returns for serious investors.',
        status: 'ACTIVE'
      },
      {
        name: 'Platinum Plan',
        amount: 1000,
        dailyROI: 150,
        duration: 30,
        description: 'Premium investment - Maximum daily earnings.',
        status: 'ACTIVE'
      }
    ];

    for (const plan of plans) {
      await prisma.investmentPlan.create({ data: plan });
    }
    console.log('✅ Investment plans created');

    // 6. Create System Settings
    const settings = [
      { key: 'MIN_WITHDRAWAL', value: '100', description: 'Minimum withdrawal amount' },
      { key: 'MAX_WITHDRAWAL', value: '50000', description: 'Maximum withdrawal amount' },
      { key: 'WITHDRAWAL_FEE', value: '5', description: 'Withdrawal fee percentage' },
      { key: 'REFERRAL_BONUS', value: '10', description: 'Referral bonus percentage' },
      { key: 'DAILY_ROI_TIME', value: '18:00', description: 'Daily ROI credit time' },
      { key: 'MAINTENANCE_MODE', value: 'false', description: 'Maintenance mode status' },
    ];

    for (const setting of settings) {
      await prisma.systemSettings.create({ data: setting });
    }
    console.log('✅ System settings created');

    console.log('\n🎉 Initial data setup completed successfully!');
    console.log('\n📋 Admin Login:');
    console.log('Email: admin@poweroyo.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error setting up initial data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupInitialData();