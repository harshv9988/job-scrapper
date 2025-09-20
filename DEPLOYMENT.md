# 🚀 Deploying Frontend Job Scraper to Render.com

This guide covers two deployment methods for your job scraper on Render.com:

1. **Web Service with Built-in Cron** (Recommended) - Runs as a web service with internal cron scheduling
2. **Dedicated Cron Job Service** - Uses Render's cron job service

## 📋 Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **Render.com Account**: Sign up at [render.com](https://render.com)
3. **Gmail Account**: For sending email reports (with App Password enabled)

## 🌐 Method 1: Web Service with Built-in Cron (Recommended)

This approach runs your scraper as a web service that includes built-in cron scheduling. Benefits:

- ✅ More control over scheduling
- ✅ Web endpoints for monitoring and manual triggers
- ✅ Better error handling and logging
- ✅ Can run continuously

### Step-by-Step Deployment

1. **Push your code to GitHub** (same as before)
2. **Sign up at [render.com](https://render.com)**
3. **Create a new Web Service** (not Cron Job)
4. **Configure the service**:
   ```
   Name: frontend-job-scraper-web
   Environment: Node
   Plan: Free
   Build Command: npm install
   Start Command: npm run web
   ```
5. **Add Environment Variables** (same as before)
6. **Deploy!**

### Web Endpoints Available

Once deployed, your scraper will have these endpoints:

- `GET /` - Main status page
- `GET /health` - Health check
- `GET /status` - Detailed status
- `POST /trigger-scrape` - Manually trigger scraping

### Benefits of Web Service Approach

- **Always running**: Service stays alive and runs cron jobs internally
- **Manual triggers**: You can trigger scraping via API calls
- **Better monitoring**: Web endpoints for health checks
- **More reliable**: Less dependent on Render's cron service
- **Easier debugging**: Better logging and error handling

## ⏰ Method 2: Dedicated Cron Job Service

This is the traditional approach using Render's cron job service.

## 🔧 Step-by-Step Deployment (Cron Job Method)

### 1. Prepare Your GitHub Repository

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: Frontend job scraper"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 2. Set Up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - **Save this password** - you'll need it for Render

### 3. Deploy on Render.com

#### Option A: Using Render Dashboard (Recommended)

1. **Sign in to Render.com** and click "New +"
2. **Select "Cron Job"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   ```
   Name: frontend-job-scraper
   Environment: Node
   Plan: Free
   Build Command: npm install
   Start Command: npm start
   Schedule: 0 */4 * * *
   ```
5. **Add Environment Variables**:
   ```
   NODE_ENV = production
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-app-password
   EMAIL_TO = recipient@example.com
   SCRAPING_DELAY = 3000
   MAX_PAGES_PER_SITE = 3
   USER_AGENT = Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
   CRON_SCHEDULE = 0 */4 * * *
   ```
6. **Click "Create Cron Job"**

#### Option B: Using render.yaml (Automatic)

1. **Ensure your `render.yaml` is in the root directory**
2. **Connect your GitHub repository to Render**
3. **Render will automatically detect and use the YAML configuration**

### 4. Verify Deployment

1. **Check the logs** in Render dashboard
2. **Wait for the first scheduled run** (or trigger manually)
3. **Check your email** for the job report

## ⏰ Cron Schedule Options

The current schedule runs every 4 hours. You can modify it:

```bash
# Every 4 hours (current)
0 */4 * * *

# Every 6 hours
0 */6 * * *

# Every day at 9 AM
0 9 * * *

# Every Monday at 9 AM
0 9 * * 1

# Every 30 minutes
*/30 * * * *
```

## 🔍 Monitoring and Troubleshooting

### View Logs

1. Go to your Render dashboard
2. Click on your cron job service
3. Go to "Logs" tab
4. Monitor for errors or success messages

### Common Issues

**"Email service configuration error"**

- Verify Gmail credentials are correct
- Ensure App Password is properly generated
- Check that 2FA is enabled on Gmail

**"Browser launch failed"**

- This is normal on Render's free tier
- The scraper uses headless mode which should work
- Consider upgrading to paid plan for better performance

**"No jobs found"**

- Check if job sites have changed their HTML structure
- Verify selectors in `data/career-portals.json`
- Check logs for specific error messages

### Manual Triggering

You can manually trigger the cron job:

1. Go to your Render dashboard
2. Click on your cron job service
3. Click "Manual Deploy" or "Trigger Now"

## 💰 Render.com Pricing

**Free Tier Limitations:**

- 750 hours per month
- Cron jobs run every 4+ hours
- Limited memory and CPU

**Paid Plans:**

- Starter: $7/month
- Standard: $25/month
- More frequent cron schedules
- Better performance

## 🔄 Updating Your Scraper

To update your deployed scraper:

```bash
# Make changes to your code
git add .
git commit -m "Update scraper logic"
git push origin main

# Render will automatically redeploy
```

## 📧 Email Configuration

The scraper will send emails to the address specified in `EMAIL_TO`. Each email includes:

- Job count by company
- CSV attachment with all job listings
- HTML summary with statistics
- Next run time information

## 🛡️ Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use environment variables** for sensitive data
3. **Regularly rotate App Passwords**
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated**

## 📊 Expected Results

After deployment, you should receive:

- **Email reports every 4 hours**
- **CSV files** with job listings
- **Company breakdown** showing job counts
- **Direct links** to job application pages

## 🆘 Support

If you encounter issues:

1. Check the Render logs first
2. Verify your environment variables
3. Test the scraper locally with `npm start`
4. Check the GitHub repository for updates

---

**🎉 Congratulations!** Your job scraper is now running automatically in the cloud!
