# Background Processes Documentation

This document describes the comprehensive background process system implemented for the PowerOYO investment platform.

## Overview

The background process system provides automated, scheduled tasks that run independently of user interactions. These processes handle critical operations like ROI distribution, system monitoring, data cleanup, and notifications.

## Architecture

### Core Components

1. **BackgroundProcessManager** (`src/lib/background-processes.ts`)
   - Central manager for all background processes
   - Handles process registration, execution, and monitoring
   - Provides error handling, retry logic, and logging

2. **Process Implementations** (`src/lib/processes/`)
   - Individual process implementations
   - Modular design for easy maintenance and testing

3. **Admin Interface** (`src/components/admin/BackgroundProcessMonitor.tsx`)
   - Real-time monitoring dashboard
   - Process control and status visualization

## Implemented Processes

### 1. Daily ROI Distribution
- **Schedule**: Daily at 12:00 AM IST (`0 0 * * *`)
- **Purpose**: Automatically distribute daily ROI to active investments
- **Features**:
  - Processes all active investments
  - Calculates and distributes ROI
  - Handles referral commissions (5-level MLM)
  - Creates transaction records
  - Sends notifications to users
  - Prevents duplicate distributions

### 2. System Health Monitoring
- **Schedule**: Every 15 minutes (`*/15 * * * *`)
- **Purpose**: Monitor system health and performance
- **Checks**:
  - Database connectivity and response time
  - Memory usage and disk space
  - Active user statistics
  - Pending transaction counts
  - System load average
- **Alerts**: Logs issues and sends notifications

### 3. Data Cleanup
- **Schedule**: Daily at 2:00 AM IST (`0 2 * * *`)
- **Purpose**: Maintain database performance and storage
- **Tasks**:
  - Cleanup old process logs (30+ days)
  - Remove expired sessions (24+ hours)
  - Archive old notifications (90+ days)
  - Archive completed investments (1+ year)
  - Remove orphaned records
  - Cleanup old system settings (6+ months)

### 4. Notification Processing
- **Schedule**: Every 5 minutes (`*/5 * * * *`)
- **Purpose**: Process pending notifications
- **Types**:
  - Email notifications
  - SMS notifications
  - System-wide notifications
  - User-specific notifications
- **Features**:
  - Retry logic for failed deliveries
  - Batch processing for efficiency
  - Cleanup of sent notifications

### 5. Weekly Report Generation
- **Schedule**: Every Sunday at 6:00 AM IST (`0 6 * * 0`)
- **Purpose**: Generate comprehensive weekly reports
- **Data**:
  - New user registrations
  - Investment statistics
  - ROI distribution totals
  - Withdrawal summaries
  - Revenue analysis

### 6. Monthly Analytics
- **Schedule**: First day of every month at 3:00 AM IST (`0 3 1 * *`)
- **Purpose**: Generate detailed monthly analytics
- **Analytics**:
  - User growth trends
  - Investment patterns
  - Revenue analysis
  - Top-performing plans
  - Performance metrics

## Configuration

### Process Configuration
Each process can be configured with:
- **Schedule**: Cron expression for timing
- **Enabled**: Whether the process is active
- **Timeout**: Maximum execution time
- **Retry Attempts**: Number of retry attempts on failure
- **Retry Delay**: Delay between retry attempts

### Example Configuration
```typescript
{
  name: 'daily-roi-distribution',
  schedule: '0 0 * * *',
  enabled: true,
  timeout: 600000, // 10 minutes
  retryAttempts: 3,
  retryDelay: 30000 // 30 seconds
}
```

## Error Handling

### Retry Logic
- Configurable retry attempts for each process
- Exponential backoff for retry delays
- Detailed error logging and reporting

### Failure Handling
- Processes are isolated to prevent cascading failures
- Failed processes don't affect other processes
- Comprehensive error logging with stack traces
- Admin notifications for critical failures

## Monitoring and Logging

### Process Logging
- All process executions are logged to the database
- Includes success/failure status, execution time, and data
- Configurable log retention period

### Real-time Monitoring
- Admin dashboard shows real-time process status
- Process control (start/stop/restart)
- Historical execution logs
- Performance metrics

### Security Logging
- All process activities are logged for security auditing
- Includes process start/stop events
- Error conditions and failure reasons
- Data access and modification logs

## API Endpoints

### Background Process Management
- `GET /api/admin/background-processes` - Get process status
- `POST /api/admin/background-processes` - Control processes
  - Actions: `start`, `stop`, `cleanup-logs`

### Process Data
- Process logs are stored in `systemSettings` table
- Key format: `process_log_{processName}_{timestamp}`
- Health checks: `health_check_{timestamp}`
- Reports: `weekly_report_{date}`, `monthly_analytics_{year}_{month}`

## Deployment Considerations

### Production Setup
1. Ensure proper timezone configuration (Asia/Kolkata)
2. Set up process monitoring and alerting
3. Configure log rotation and cleanup
4. Set up database backups before cleanup processes
5. Monitor system resources and performance

### Environment Variables
```env
# Database
DATABASE_URL="your-database-url"

# JWT
JWT_SECRET="your-jwt-secret"

# Process Configuration
NODE_ENV="production"
TZ="Asia/Kolkata"
```

### Cron Job Setup
For manual execution or additional scheduling:
```bash
# Daily ROI distribution
0 0 * * * cd /path/to/project && npx tsx scripts/cron-roi.ts

# System health check
*/15 * * * * cd /path/to/project && npx tsx scripts/health-check.ts
```

## Troubleshooting

### Common Issues

1. **Process Not Starting**
   - Check if processes are enabled
   - Verify cron schedule format
   - Check system timezone settings

2. **High Memory Usage**
   - Monitor process execution times
   - Check for memory leaks in process code
   - Adjust timeout settings if needed

3. **Database Connection Issues**
   - Verify database connectivity
   - Check connection pool settings
   - Monitor database performance

4. **Failed Notifications**
   - Check email/SMS service configuration
   - Verify API credentials and limits
   - Monitor retry attempts and failures

### Debugging
- Check process logs in database
- Monitor system logs for errors
- Use admin dashboard for real-time status
- Enable debug logging for detailed information

## Security Considerations

### Access Control
- Only admin users can control background processes
- Process logs contain sensitive information
- Implement proper authentication and authorization

### Data Protection
- Sensitive data is logged securely
- Process data is encrypted in transit
- Regular security audits of process logs

### Monitoring
- Monitor for unusual process behavior
- Alert on process failures
- Track process execution patterns

## Future Enhancements

### Planned Features
- [ ] Process dependency management
- [ ] Dynamic process scheduling
- [ ] Process performance optimization
- [ ] Advanced alerting and notifications
- [ ] Process execution analytics
- [ ] Automated scaling based on load

### Integration Opportunities
- [ ] External monitoring services (DataDog, New Relic)
- [ ] Advanced notification services (Slack, Discord)
- [ ] Process orchestration tools (Kubernetes CronJobs)
- [ ] Machine learning for process optimization

## Support

For issues or questions regarding background processes:
- Check the admin dashboard for process status
- Review process logs in the database
- Contact system administrators
- Refer to this documentation for configuration details

---

**Note**: This background process system is designed to be robust, scalable, and maintainable. Regular monitoring and maintenance are essential for optimal performance.