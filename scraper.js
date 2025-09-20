const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class JobScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.jobLinks = [];
        this.careerPortals = null;
        this.keywords = null;
    }

    async initialize() {
        console.log('🚀 Initializing job scraper...');

        // Load configuration files
        await this.loadConfiguration();

        // Launch browser with Render.com specific configuration
        const launchOptions = {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        };

        // On Render.com, use the installed Chrome
        if (process.env.NODE_ENV === 'production') {
            const fs = require('fs');
            const chromePath = '/opt/render/.cache/puppeteer/chrome-linux64/chrome';

            console.log('🔧 Checking Chrome installation...');
            console.log('🔧 Chrome path:', chromePath);
            console.log('🔧 Chrome exists:', fs.existsSync(chromePath));

            if (fs.existsSync(chromePath)) {
                launchOptions.executablePath = chromePath;
                console.log('✅ Using production Chrome path:', launchOptions.executablePath);
            } else {
                console.log('⚠️ Chrome not found at expected path, using default');
            }
        }

        this.browser = await puppeteer.launch(launchOptions);

        this.page = await this.browser.newPage();
        await this.page.setUserAgent(process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await this.page.setViewport({ width: 1920, height: 1080 });

        console.log('✅ Browser initialized successfully');
    }

    async loadConfiguration() {
        try {
            const careerPortalsPath = path.join(__dirname, 'data', 'career-portals.json');
            const keywordsPath = path.join(__dirname, 'data', 'job-keywords.json');

            const careerPortalsData = await fs.readFile(careerPortalsPath, 'utf8');
            const keywordsData = await fs.readFile(keywordsPath, 'utf8');

            this.careerPortals = JSON.parse(careerPortalsData);
            this.keywords = JSON.parse(keywordsData);

            console.log(`📋 Loaded ${this.careerPortals.length} career portals`);
            console.log(`🔍 Loaded ${this.keywords.primary_keywords.length} primary keywords`);
        } catch (error) {
            console.error('❌ Error loading configuration:', error.message);
            throw error;
        }
    }

    async scrapeJobSite(portal, keyword) {
        try {
            console.log(`🔍 Scraping ${portal.name} for "${keyword}"...`);

            // Check if this is a company-specific scraper
            if (portal.scrapingType === 'company-specific') {
                return await this.scrapeCompanySpecific(portal, keyword);
            }

            // Fallback to generic scraping (if needed for other sites)
            return await this.scrapeGeneric(portal, keyword);
        } catch (error) {
            console.error(`❌ Error scraping ${portal.name}:`, error.message);
            return [];
        }
    }

    async scrapeCompanySpecific(portal, keyword) {
        switch (portal.name) {
            case 'Microsoft':
                return await this.scrapeMicrosoft(portal, keyword);
            case 'Amazon':
                return await this.scrapeAmazon(portal, keyword);
            default:
                console.log(`⚠️ No specific scraper found for ${portal.name}, using generic method`);
                return await this.scrapeGeneric(portal, keyword);
        }
    }

    async scrapeMicrosoft(portal, keyword) {
        console.log(`🏢 Scraping Microsoft careers...`);

        // Use static URL directly (no keyword replacement needed)
        const searchUrl = portal.searchUrl;

        await this.page.goto(searchUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for Microsoft's dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Scroll to load more jobs if needed
        await this.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const jobs = await this.page.evaluate(() => {
            const jobElements = document.querySelectorAll('div[aria-label^="Job item"]');
            const jobs = [];

            jobElements.forEach((jobElement) => {
                try {
                    // Extract job ID from aria-label
                    const ariaLabel = jobElement.getAttribute('aria-label');
                    const jobIdMatch = ariaLabel.match(/Job item (\d+)/);

                    if (!jobIdMatch) return;

                    const jobId = jobIdMatch[1];

                    // Find job title within the job element
                    const titleElement = jobElement.querySelector('h3[data-automation-id="jobTitle"]');
                    const title = titleElement ? titleElement.textContent.trim() : 'Job Title Not Found';

                    // Find company name
                    const companyElement = jobElement.querySelector('span[data-automation-id="companyName"]');
                    const company = companyElement ? companyElement.textContent.trim() : 'Microsoft';

                    // Simple static URL with just job ID
                    const jobUrl = `https://jobs.careers.microsoft.com/global/en/job/${jobId}/`;

                    // Add all jobs found (no secondary keyword filtering)
                    jobs.push({
                        title: title,
                        company: company,
                        link: jobUrl,
                        source: 'Microsoft',
                        scrapedAt: new Date().toISOString(),
                        jobId: jobId
                    });
                } catch (error) {
                    console.warn('Error extracting Microsoft job data:', error);
                }
            });

            return jobs;
        });

        console.log(`📊 Found ${jobs.length} jobs at Microsoft`);
        return jobs;
    }

    async scrapeAmazon(portal, keyword) {
        console.log(`🏢 Scraping Amazon careers...`);

        // Use static URL directly (no keyword replacement needed)
        const searchUrl = portal.searchUrl;

        await this.page.goto(searchUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for Amazon's dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Scroll to load more jobs if needed
        await this.page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const jobs = await this.page.evaluate(() => {
            const jobElements = document.querySelectorAll('a.job-link');
            const jobs = [];

            jobElements.forEach((jobElement) => {
                try {
                    // Get the href attribute (e.g., "en/jobs/3078075/frontend-engineer-ii-hst-health-foundation")
                    const href = jobElement.getAttribute('href');

                    if (!href) return;

                    // Construct the full Amazon job URL
                    const jobUrl = `https://www.amazon.jobs/${href}`;

                    // Find job title within the job element or nearby elements
                    const titleElement = jobElement.querySelector('h3') ||
                        jobElement.querySelector('.job-title') ||
                        jobElement.closest('.job-tile')?.querySelector('h3');
                    const title = titleElement ? titleElement.textContent.trim() : 'Job Title Not Found';

                    // Find company name (Amazon for all jobs)
                    const company = 'Amazon';

                    // Add all jobs found (no filtering)
                    jobs.push({
                        title: title,
                        company: company,
                        link: jobUrl,
                        source: 'Amazon',
                        scrapedAt: new Date().toISOString(),
                        jobId: href.match(/\/(\d+)\//)?.[1] || 'Unknown'
                    });
                } catch (error) {
                    console.warn('Error extracting Amazon job data:', error);
                }
            });

            return jobs;
        });

        console.log(`📊 Found ${jobs.length} jobs at Amazon`);
        return jobs;
    }

    async scrapeGeneric(portal, keyword) {
        console.log(`🔍 Generic scraping ${portal.name} for "${keyword}"...`);

        const searchUrl = portal.searchUrl.replace('{keywords}', encodeURIComponent(keyword));

        await this.page.goto(searchUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const jobs = await this.extractJobLinks(portal);
        console.log(`📊 Found ${jobs.length} jobs on ${portal.name}`);

        return jobs;
    }

    async extractJobLinks(portal) {
        try {
            const jobs = await this.page.evaluate((selectors) => {
                const jobElements = document.querySelectorAll(selectors.jobLink);
                const jobs = [];

                jobElements.forEach((element, index) => {
                    try {
                        const link = element.href || element.getAttribute('href');
                        const title = element.textContent?.trim() ||
                            element.querySelector(selectors.jobTitle)?.textContent?.trim() ||
                            'Job Title Not Found';

                        const companyElement = document.querySelectorAll(selectors.company)[index];
                        const company = companyElement?.textContent?.trim() || 'Company Not Found';

                        if (link && title) {
                            jobs.push({
                                title: title,
                                company: company,
                                link: link.startsWith('http') ? link : new URL(link, window.location.href).href,
                                source: portal.name,
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    } catch (err) {
                        console.warn('Error extracting job data:', err);
                    }
                });

                return jobs;
            }, portal.selectors);

            return jobs;
        } catch (error) {
            console.error('Error extracting job links:', error.message);
            return [];
        }
    }

    async scrapeAllSites() {
        console.log('🌐 Starting comprehensive job scraping...');

        for (const portal of this.careerPortals) {
            console.log(`\n🏢 Processing ${portal.name}...`);

            // For company-specific scrapers, use fewer keywords to avoid rate limiting
            const keywordLimit = portal.scrapingType === 'company-specific' ? 3 : 5;

            for (const keyword of this.keywords.primary_keywords.slice(0, keywordLimit)) {
                const jobs = await this.scrapeJobSite(portal, keyword);
                this.jobLinks.push(...jobs);

                // Add delay between requests (longer for company sites)
                const delay = portal.scrapingType === 'company-specific' ? 5000 : 2000;
                await new Promise(resolve => setTimeout(resolve, parseInt(process.env.SCRAPING_DELAY) || delay));
            }
        }

        // Remove duplicates based on URL
        this.jobLinks = this.removeDuplicates(this.jobLinks);
        console.log(`🎯 Total unique jobs found: ${this.jobLinks.length}`);

        return this.jobLinks;
    }

    removeDuplicates(jobs) {
        const seen = new Set();
        return jobs.filter(job => {
            if (seen.has(job.link)) {
                return false;
            }
            seen.add(job.link);
            return true;
        });
    }

    filterRelevantJobs(jobs) {
        // No filtering - return all jobs found
        return jobs;
    }

    async generateCSV() {
        const csv = require('csv-writer').createObjectCsvWriter;
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `frontend-jobs-${timestamp}.csv`;
        const filepath = path.join(__dirname, 'output', filename);

        // Create output directory if it doesn't exist
        await fs.mkdir(path.dirname(filepath), { recursive: true });

        const csvWriter = csv({
            path: filepath,
            header: [
                { id: 'title', title: 'Job Title' },
                { id: 'company', title: 'Company' },
                { id: 'link', title: 'Job Link' },
                { id: 'source', title: 'Source' },
                { id: 'scrapedAt', title: 'Scraped At' }
            ]
        });

        await csvWriter.writeRecords(this.jobLinks);
        console.log(`📄 CSV file generated: ${filepath}`);

        return { filepath, filename };
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }
}

module.exports = JobScraper;
