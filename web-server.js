require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const JobScrapingApp = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'Job Scraper is running!',
        timestamp: new Date().toISOString(),
        nextRun: 'Check logs for cron schedule',
        endpoints: {
            health: '/health',
            trigger: '/trigger-scrape',
            status: '/status'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Manual trigger endpoint
app.post('/trigger-scrape', async (req, res) => {
    try {
        console.log('🚀 Manual scrape triggered via API');

        const jobApp = new JobScrapingApp();
        await jobApp.runOnce();

        res.json({
            status: 'success',
            message: 'Scraping job completed',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Manual scrape failed:', error.message);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Status endpoint
app.get('/status', (req, res) => {
    const cronSchedule = process.env.CRON_SCHEDULE || '0 */4 * * *';
    res.json({
        status: 'running',
        cronSchedule: cronSchedule,
        lastRun: 'Check application logs',
        nextRun: 'Scheduled by cron',
        timestamp: new Date().toISOString()
    });
});

// Initialize the job scraping app
const jobApp = new JobScrapingApp();

// Set up cron job
const cronSchedule = process.env.CRON_SCHEDULE || '0 */4 * * *';
console.log(`⏰ Setting up cron job with schedule: ${cronSchedule}`);

cron.schedule(cronSchedule, async () => {
    console.log('⏰ Cron job triggered');
    try {
        await jobApp.runScrapingJob();
    } catch (error) {
        console.error('❌ Cron job failed:', error.message);
    }
}, {
    scheduled: true,
    timezone: "America/New_York"
});

console.log('✅ Cron job scheduled successfully');

// Start the web server
app.listen(PORT, () => {
    console.log(`🌐 Job Scraper Web Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🚀 Manual trigger: POST http://localhost:${PORT}/trigger-scrape`);
    console.log(`📈 Status: http://localhost:${PORT}/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
