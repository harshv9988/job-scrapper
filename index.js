require('dotenv').config();
const cron = require('node-cron');
const JobScraper = require('./scraper');
const EmailService = require('./emailService');
const fs = require('fs').promises;
const path = require('path');

class JobScrapingApp {
    constructor() {
        this.scraper = new JobScraper();
        this.emailService = new EmailService();
        this.isRunning = false;
    }

    async runScrapingJob() {
        if (this.isRunning) {
            console.log('⏳ Scraping job already running, skipping...');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting automated job scraping...');
        console.log(`⏰ Started at: ${new Date().toISOString()}`);

        try {
            // Initialize scraper
            await this.scraper.initialize();

            // Scrape all job sites
            const allJobs = await this.scraper.scrapeAllSites();

            // Filter for relevant frontend jobs
            const relevantJobs = this.scraper.filterRelevantJobs(allJobs);

            console.log(`📊 Total jobs found: ${allJobs.length}`);
            console.log(`🎯 Relevant frontend jobs: ${relevantJobs.length}`);

            if (relevantJobs.length > 0) {
                // Update scraper with filtered jobs
                this.scraper.jobLinks = relevantJobs;

                // Generate CSV file
                const { filepath, filename } = await this.scraper.generateCSV();

                // Calculate jobs by company
                const jobsByCompany = relevantJobs.reduce((acc, job) => {
                    acc[job.company] = (acc[job.company] || 0) + 1;
                    return acc;
                }, {});

                // Send email with CSV attachment
                const emailResult = await this.emailService.sendJobReport(
                    filepath,
                    relevantJobs.length,
                    allJobs.length,
                    jobsByCompany
                );

                if (emailResult.success) {
                    console.log('✅ Job report sent successfully via email');
                } else {
                    console.error('❌ Failed to send email:', emailResult.error);
                }

                // Clean up CSV file after sending (optional)
                // await fs.unlink(filepath);
                // console.log('🧹 Temporary CSV file cleaned up');

            } else {
                console.log('📭 No relevant frontend jobs found in this run');

                // Send notification about no jobs found
                await this.emailService.sendJobReport(
                    null,
                    0,
                    allJobs.length,
                    {}
                );
            }

        } catch (error) {
            console.error('❌ Error during scraping job:', error.message);
            console.error('Stack trace:', error.stack);

            // Send error report via email
            await this.emailService.sendErrorReport(error.message, error.stack);

        } finally {
            // Clean up
            await this.scraper.cleanup();
            this.isRunning = false;
            console.log(`🏁 Scraping job completed at: ${new Date().toISOString()}`);
        }
    }

    startCronJob() {
        const cronSchedule = process.env.CRON_SCHEDULE || '0 */4 * * *'; // Every 1 minute by default

        console.log(`⏰ Setting up cron job with schedule: ${cronSchedule}`);
        console.log('📅 Cron schedule explanation:');
        console.log('   - */1: minute (every 1 minute)');
        console.log('   - *: hour (every hour)');
        console.log('   - *: day of month (every day)');
        console.log('   - *: month (every month)');
        console.log('   - *: day of week (every day of week)');

        cron.schedule(cronSchedule, () => {
            console.log('⏰ Cron job triggered');
            this.runScrapingJob();
        }, {
            scheduled: true,
            timezone: "America/New_York" // Adjust timezone as needed
        });

        console.log('✅ Cron job scheduled successfully');
    }

    async runOnce() {
        console.log('🔄 Running scraper once (manual execution)...');
        await this.runScrapingJob();
    }

    async start() {
        console.log('🎯 Frontend Job Scraper Application Starting...');
        console.log('==============================================');

        // Check environment variables
        this.validateEnvironment();

        // Create output directory
        await this.ensureOutputDirectory();

        // Check if running in production (for Render.com)
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            console.log('🌐 Running in production mode');
            console.log('🚀 Starting cron job scheduler...');
            this.startCronJob();

            // Keep the process alive
            console.log('💤 Application running, waiting for cron triggers...');
            process.on('SIGTERM', () => {
                console.log('🛑 Received SIGTERM, shutting down gracefully...');
                process.exit(0);
            });

        } else {
            console.log('🔧 Running in development mode');
            console.log('⚡ Running scraper once for testing...');
            await this.runOnce();
        }
    }

    validateEnvironment() {
        const requiredEnvVars = [
            'EMAIL_HOST',
            'EMAIL_USER',
            'EMAIL_PASS',
            'EMAIL_TO'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('❌ Missing required environment variables:');
            missingVars.forEach(varName => console.error(`   - ${varName}`));
            console.error('\nPlease check your .env file or environment configuration.');
            process.exit(1);
        }

        console.log('✅ Environment variables validated');
    }

    async ensureOutputDirectory() {
        const outputDir = path.join(__dirname, 'output');
        try {
            await fs.mkdir(outputDir, { recursive: true });
            console.log('✅ Output directory ready');
        } catch (error) {
            console.error('❌ Error creating output directory:', error.message);
            throw error;
        }
    }
}

// Main execution
async function main() {
    const app = new JobScrapingApp();

    try {
        await app.start();
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
if (require.main === module) {
    main();
}

module.exports = JobScrapingApp;
