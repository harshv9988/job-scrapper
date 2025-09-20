# 🎯 Frontend Job Scraper

An automated web scraping application that searches for frontend engineering job opportunities across multiple career portals and sends the results via email. Built with Node.js, Puppeteer, and designed to run as a scheduled cron job.

## ✨ Features

- **Multi-Platform Scraping**: Searches across LinkedIn, Indeed, Glassdoor, AngelList, Stack Overflow, and Remote.co
- **Smart Filtering**: Automatically filters for frontend-specific roles and excludes backend/full-stack positions
- **Email Reports**: Sends beautifully formatted HTML emails with CSV attachments
- **Automated Scheduling**: Runs every 4 hours via cron job
- **Cloud Ready**: Pre-configured for deployment on Render.com
- **Duplicate Removal**: Automatically removes duplicate job postings
- **Error Handling**: Comprehensive error reporting and logging

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Gmail account with App Password enabled
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd scrapping
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your email configuration:

   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_TO=recipient@example.com
   ```

4. **Test the scraper**
   ```bash
   npm run dev
   ```

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### Other Email Providers

Update the email configuration in `.env`:

```env
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

## 🔧 Configuration

### Job Keywords

Edit `data/job-keywords.json` to customize your search:

```json
{
  "primary_keywords": ["frontend engineer", "react developer", "vue developer"],
  "exclude_keywords": ["backend", "fullstack", "devops"]
}
```

### Career Portals

Modify `data/career-portals.json` to add or remove job sites:

```json
[
  {
    "name": "LinkedIn Jobs",
    "searchUrl": "https://www.linkedin.com/jobs/search/?keywords={keywords}",
    "selectors": {
      "jobLink": "a[data-control-name='job_card_click']"
    }
  }
]
```

### Scraping Settings

Customize scraping behavior in `.env`:

```env
SCRAPING_DELAY=2000        # Delay between requests (ms)
MAX_PAGES_PER_SITE=5       # Maximum pages to scrape per site
CRON_SCHEDULE=0 */4 * * *  # Cron schedule (every 4 hours)
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev          # Run once with file watching
npm start            # Run once without watching
```

### Production Mode

```bash
NODE_ENV=production npm start
```

## ☁️ Deployment on Render.com

### Quick Start

1. **Push your code to GitHub**
2. **Sign up at [render.com](https://render.com)**
3. **Create a new Cron Job service**
4. **Connect your GitHub repository**
5. **Add environment variables** (see DEPLOYMENT.md for details)
6. **Deploy!**

### Detailed Instructions

For complete deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)** which includes:

- Step-by-step GitHub setup
- Gmail App Password configuration
- Render.com deployment options
- Environment variable setup
- Monitoring and troubleshooting
- Security best practices

### Environment Variables Required

```env
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=recipient@example.com
```

## 📊 Output Format

The scraper generates CSV files with the following columns:

| Column     | Description                      |
| ---------- | -------------------------------- |
| Job Title  | The job position title           |
| Company    | Company name                     |
| Job Link   | Direct link to job application   |
| Source     | Job board where it was found     |
| Scraped At | Timestamp of when it was scraped |

## 📧 Email Reports

Each email report includes:

- **HTML Summary**: Job statistics and search criteria
- **CSV Attachment**: Complete list of job opportunities
- **Filtering Details**: What was included/excluded
- **Next Run Time**: When the next automated search will occur

## 🛠️ Troubleshooting

### Common Issues

**"Email service configuration error"**

- Verify your email credentials in `.env`
- Check that App Password is correctly generated for Gmail
- Ensure 2FA is enabled on your email account

**"No jobs found"**

- Check if job sites have changed their HTML structure
- Update selectors in `data/career-portals.json`
- Verify keywords are relevant to current job market

**"Browser launch failed"**

- Ensure you have sufficient memory available
- On Render.com, the free tier has limited resources
- Consider upgrading to a paid plan for better performance

### Debugging

Enable verbose logging by setting:

```env
NODE_ENV=development
```

Check logs in the `output/` directory for detailed scraping information.

## 🔄 Cron Schedule Examples

```bash
0 */4 * * *    # Every 4 hours
0 9 * * *      # Every day at 9 AM
0 9 * * 1      # Every Monday at 9 AM
*/30 * * * *   # Every 30 minutes
```

## 📁 Project Structure

```
scrapping/
├── data/
│   ├── career-portals.json    # Job site configurations
│   └── job-keywords.json      # Search keywords
├── output/                    # Generated CSV files
├── scraper.js                 # Main scraping logic
├── emailService.js            # Email functionality
├── index.js                   # Application entry point
├── render.yaml               # Render.com deployment config
├── package.json              # Dependencies
└── README.md                 # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -am 'Add feature'`
6. Push: `git push origin feature-name`
7. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational and personal use only. Please respect the terms of service of the websites being scraped and use responsibly. Consider rate limiting and be mindful of the load you put on external servers.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs in the `output/` directory
3. Verify your environment configuration
4. Open an issue on GitHub with detailed error information

---

**Happy job hunting! 🎯**
