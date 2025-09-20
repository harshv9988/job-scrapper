# 🚀 Deploying to Render.com as Web Service

## Quick Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create Web Service on Render.com

1. **Go to [render.com](https://render.com)** and sign in
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

```
Name: frontend-job-scraper
Environment: Node
Plan: Free
Build Command: npm install
Start Command: npm run web
```

### 3. Add Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV = production
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
EMAIL_TO = recipient@example.com
CRON_SCHEDULE = */1 * * * *
PORT = 10000
```

### 4. Deploy

Click **"Create Web Service"** and Render will:

- Install dependencies
- Start the web server
- Run cron jobs every minute

## ✅ What You'll Get

- **Web service** running continuously
- **Cron jobs** running every minute
- **Health check** endpoint at `https://your-app.onrender.com/health`
- **Manual trigger** at `https://your-app.onrender.com/trigger-scrape`
- **Email reports** sent every minute

## 🔍 Troubleshooting

### "No open ports detected"

This usually means:

1. **Wrong service type** - Make sure you selected "Web Service" not "Cron Job"
2. **Wrong start command** - Use `npm run web` not `npm start`
3. **Missing PORT** - Render automatically sets PORT environment variable

### Check Logs

1. Go to your Render dashboard
2. Click on your web service
3. Go to "Logs" tab
4. Look for:
   - `🔧 Using port: 10000`
   - `🌐 Job Scraper Web Server running on port 10000`
   - `✅ Cron job scheduled successfully`

### Manual Health Check

Once deployed, visit:

- `https://your-app-name.onrender.com/` - Main status
- `https://your-app-name.onrender.com/health` - Health check

## 📧 Gmail Setup

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" → Generate password
   - Use this in `EMAIL_PASS`

## ⚡ Quick Test

After deployment, you can manually trigger scraping:

```bash
curl -X POST https://your-app-name.onrender.com/trigger-scrape
```

This will run the scraper immediately and send you an email report!
