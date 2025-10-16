import { Server } from 'socket.io';
import { db } from './db';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user to their personal room for targeted updates
    socket.on('join-user-room', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join admin room for admin updates
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log('Admin joined admin room');
    });

    // Real-time user updates
    socket.on('user-update', async (data: { userId: string; type: string; payload: any }) => {
      const { userId, type, payload } = data;
      
      // Notify admin room
      io.to('admin-room').emit('admin-user-update', {
        userId,
        type,
        payload,
        timestamp: new Date().toISOString()
      });

      // Notify user if it's not their own update
      if (socket.id !== userId) {
        io.to(`user-${userId}`).emit('user-profile-update', {
          type,
          payload,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Real-time transaction updates
    socket.on('transaction-update', async (data: { userId: string; transaction: any }) => {
      const { userId, transaction } = data;
      
      // Notify user
      io.to(`user-${userId}`).emit('new-transaction', {
        transaction,
        timestamp: new Date().toISOString()
      });

      // Notify admin
      io.to('admin-room').emit('admin-transaction-update', {
        userId,
        transaction,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time withdrawal updates
    socket.on('withdrawal-update', async (data: { withdrawalId: string; status: string; adminRemark?: string }) => {
      const { withdrawalId, status, adminRemark } = data;
      
      // Get withdrawal details
      const withdrawal = await db.withdrawal.findUnique({
        where: { id: withdrawalId },
        include: { user: true }
      });

      if (withdrawal) {
        // Notify user
        io.to(`user-${withdrawal.userId}`).emit('withdrawal-status-update', {
          withdrawalId,
          status,
          adminRemark,
          timestamp: new Date().toISOString()
        });

        // Notify admin
        io.to('admin-room').emit('admin-withdrawal-update', {
          withdrawal,
          status,
          adminRemark,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Real-time investment updates
    socket.on('investment-update', async (data: { userId: string; investment: any }) => {
      const { userId, investment } = data;
      
      // Notify user
      io.to(`user-${userId}`).emit('new-investment', {
        investment,
        timestamp: new Date().toISOString()
      });

      // Notify admin
      io.to('admin-room').emit('admin-investment-update', {
        userId,
        investment,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time ROI credit notifications
    socket.on('roi-credited', async (data: { userId: string; amount: number; investmentId: string }) => {
      const { userId, amount, investmentId } = data;
      
      // Notify user
      io.to(`user-${userId}`).emit('roi-credited', {
        amount,
        investmentId,
        timestamp: new Date().toISOString()
      });

      // Notify admin
      io.to('admin-room').emit('admin-roi-credited', {
        userId,
        amount,
        investmentId,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time KYC status updates
    socket.on('kyc-update', async (data: { userId: string; status: string; kycId?: string; adminRemark?: string }) => {
      const { userId, status, kycId, adminRemark } = data;
      
      // Notify user
      io.to(`user-${userId}`).emit('kyc-status-update', {
        status,
        kycId,
        adminRemark,
        timestamp: new Date().toISOString()
      });

      // Notify admin
      io.to('admin-room').emit('admin-kyc-update', {
        userId,
        status,
        kycId,
        adminRemark,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time KYC submission updates
    socket.on('kyc-submission-update', async (data: { userId: string; status: string; message?: string }) => {
      const { userId, status, message } = data;
      
      // Notify user
      io.to(`user-${userId}`).emit('kyc-submission-update', {
        status,
        message,
        timestamp: new Date().toISOString()
      });

      // Notify admin
      io.to('admin-room').emit('admin-kyc-submission', {
        userId,
        status,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time plan updates
    socket.on('plan-update', async (data: { plan: any; action: string }) => {
      const { plan, action } = data;
      
      // Notify all admin users
      io.to('admin-room').emit('admin-plan-update', {
        plan,
        action,
        timestamp: new Date().toISOString()
      });

      // If plan is deactivated, notify active investors
      if (action === 'deactivate') {
        const activeInvestments = await db.investment.findMany({
          where: { planId: plan.id, status: 'ACTIVE' },
          select: { userId: true }
        });

        activeInvestments.forEach(investment => {
          io.to(`user-${investment.userId}`).emit('plan-deactivated', {
            plan,
            timestamp: new Date().toISOString()
          });
        });
      }
    });

    // Real-time UPI payment updates
    socket.on('upi-update', async (data: { upi: any; action: string }) => {
      const { upi, action } = data;
      
      // Notify all admin users
      io.to('admin-room').emit('admin-upi-update', {
        upi,
        action,
        timestamp: new Date().toISOString()
      });
    });

    // Real-time company details updates
    socket.on('company-update', async (data: { company: any }) => {
      const { company } = data;
      
      // Notify all connected users
      io.emit('company-details-updated', {
        company,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to PowerOYO Real-time Server!',
      timestamp: new Date().toISOString()
    });
  });
};