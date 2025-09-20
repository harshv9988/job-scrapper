const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection configuration
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Email service configuration error:', error.message);
            } else {
                console.log('✅ Email service ready to send messages');
            }
        });
    }

    async sendJobReport(csvFilePath, jobCount, totalJobsFound, jobsByCompany = {}) {
        try {
            console.log('📧 Preparing to send email report...');

            const mailOptions = {
                from: `"Job Scraper Bot" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: `🎯 Frontend Job Report - ${new Date().toLocaleDateString()} (${jobCount} Jobs)`,
                html: this.generateEmailHTML(jobCount, totalJobsFound, jobsByCompany),
                attachments: []
            };

            // Only attach CSV file if it exists and has jobs
            if (csvFilePath && jobCount > 0) {
                try {
                    const csvFilename = path.basename(csvFilePath);
                    const csvContent = await fs.readFile(csvFilePath);

                    mailOptions.attachments.push({
                        filename: csvFilename,
                        content: csvContent,
                        contentType: 'text/csv'
                    });

                    console.log(`📎 Attaching CSV file: ${csvFilename}`);
                } catch (csvError) {
                    console.warn('⚠️ Could not attach CSV file:', csvError.message);
                }
            } else {
                console.log('📭 No CSV file to attach (no jobs found or file path is null)');
            }

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.messageId);

            return {
                success: true,
                messageId: info.messageId,
                jobCount: jobCount
            };
        } catch (error) {
            console.error('❌ Error sending email:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    generateEmailHTML(jobCount, totalJobsFound, jobsByCompany = {}) {
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat-box { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 14px; color: #666; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .highlight { background: #fff3cd; padding: 10px; border-radius: 4px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Frontend Job Scraper Report</h1>
                <p>Automated Job Search Results</p>
            </div>
            
            <div class="content">
                <h2>📊 Scraping Summary</h2>
                <p><strong>Report Generated:</strong> ${currentDate}</p>
                
                <div class="stats">
                    <div class="stat-box">
                        <div class="stat-number">${jobCount}</div>
                        <div class="stat-label">Relevant Jobs Found</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${totalJobsFound}</div>
                        <div class="stat-label">Total Jobs Scraped</div>
                    </div>
                </div>
                
                <div class="highlight">
                    <strong>📋 What's Included:</strong>
                    <ul>
                        ${jobCount > 0 ? `
                        <li>Complete CSV file with all job listings</li>
                        <li>Job titles, companies, and direct application links</li>
                        <li>Source information for each job posting</li>
                        <li>Filtered for frontend developer positions only</li>
                        ` : `
                        <li>No frontend jobs found in this search cycle</li>
                        <li>Search will continue automatically every 4 hours</li>
                        <li>Check back for future opportunities</li>
                        `}
                    </ul>
                </div>
                
                <h3>🏢 Jobs by Company</h3>
                ${Object.keys(jobsByCompany).length > 0 ? `
                <div style="margin: 15px 0;">
                    ${Object.entries(jobsByCompany).map(([company, count]) => `
                        <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #667eea;">
                            <strong>${company}:</strong> ${count} job${count !== 1 ? 's' : ''}
                        </div>
                    `).join('')}
                </div>
                ` : `
                <p>No company breakdown available for this search cycle.</p>
                `}
                
                <h3>🔍 Search Criteria</h3>
                <p>The scraper searched for frontend engineering positions across multiple job boards. All results are included without filtering.</p>
                
                <h3>📈 Next Steps</h3>
                <ol>
                    ${jobCount > 0 ? `
                    <li>Review the attached CSV file</li>
                    <li>Visit job application pages directly using the provided links</li>
                    <li>Apply to positions that match your skills and preferences</li>
                    ` : `
                    <li>Wait for the next automated search (runs every 4 hours)</li>
                    <li>Consider expanding search criteria if needed</li>
                    <li>Check other job boards manually for immediate opportunities</li>
                    `}
                </ol>
            </div>
            
            <div class="footer">
                <p>🤖 This report was generated automatically by the Frontend Job Scraper</p>
                <p>Next automated search will run in 4 hours</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }

    async sendErrorReport(errorMessage, stackTrace) {
        try {
            console.log('📧 Sending error report...');

            const mailOptions = {
                from: `"Job Scraper Bot" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_TO,
                subject: `❌ Job Scraper Error - ${new Date().toLocaleDateString()}`,
                html: `
        <h2>Job Scraper Error Report</h2>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${stackTrace}</pre>
        `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Error report sent successfully');
        } catch (error) {
            console.error('❌ Failed to send error report:', error.message);
        }
    }
}

module.exports = EmailService;
