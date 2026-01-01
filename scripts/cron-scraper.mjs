#!/usr/bin/env node
/**
 * City of Doral Automated Content Scraper
 *
 * Designed to run daily via cron at 2:00 AM EST
 * Scrapes cityofdoral.com and doralpd.com, updates knowledge base
 *
 * Cron setup example:
 * 0 2 * * * cd /path/to/cityofdoral && node scripts/cron-scraper.mjs >> /var/log/doral-scraper.log 2>&1
 *
 * Manual run:
 * node scripts/cron-scraper.mjs
 *
 * With email notification on failure:
 * node scripts/cron-scraper.mjs --notify admin@cityofdoral.com
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const CONFIG = {
  scrapedDir: join(__dirname, '..', 'Website Scrapped'),
  outputFile: join(__dirname, '..', 'public', 'knowledge-base.json'),
  backupDir: join(__dirname, '..', 'data', 'kb-backups'),
  logFile: join(__dirname, '..', 'data', 'scraper-log.json'),
  maxContentLength: 5000,
  targets: [
    { domain: 'cityofdoral.com', baseUrl: 'https://www.cityofdoral.com' },
    { domain: 'doralpd.com', baseUrl: 'https://www.doralpd.com' }
  ]
};

// Sections to include
const MAIN_SECTIONS = [
  'About', 'Businesses', 'Departments', 'Residents', 'Visitors',
  'Government-Center', 'Elected-officials', 'Online-Services',
  'News-articles', 'Events-directory', 'Police'
];

// Parse command line args
const args = process.argv.slice(2);
const notifyEmail = args.includes('--notify') ? args[args.indexOf('--notify') + 1] : null;
const dryRun = args.includes('--dry-run');

// Logging helper
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, data };
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
  return logEntry;
}

// Files to skip
function shouldSkipFile(filePath) {
  const name = basename(filePath).toLowerCase();
  return name.includes('_spanish') ||
         name.includes('lang_update') ||
         !name.includes('index.html');
}

// Get all HTML files recursively
function getHtmlFiles(dir, files = []) {
  if (!existsSync(dir)) return files;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!item.startsWith('.') && !item.startsWith('files') && !item.includes('WebResource')) {
        getHtmlFiles(fullPath, files);
      }
    } else if (item.endsWith('.html') && !shouldSkipFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Extract section from path
function getSection(filePath, scrapedDir) {
  const relPath = relative(scrapedDir, filePath);
  const parts = relPath.split('/');
  return parts[0] || 'Other';
}

// Clean text content
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .trim();
}

// Generate slug ID
function generateId(title, filePath, scrapedDir) {
  const relPath = relative(scrapedDir, filePath);
  const slug = relPath
    .replace('/index.html', '')
    .replace(/\//g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'home';
}

// Parse a single HTML file
function parseHtmlFile(filePath, scrapedDir) {
  try {
    const html = readFileSync(filePath, 'utf-8');
    const $ = load(html);

    $('script, style, noscript, iframe').remove();

    let title = $('title').text().trim();
    title = title.replace(/\s*[-|]\s*City of Doral.*$/i, '').trim();
    title = title.replace(/\s*[-|]\s*Ciudad de Doral.*$/i, '').trim();
    title = title.replace(/\s*[-|]\s*Doral Police.*$/i, '').trim();

    if (!title || title.length < 3) return null;

    let content = '';
    const contentSelectors = [
      '#main-content', '.main-content', '.content-main-container',
      '.wysiwyg-content', 'main', 'article'
    ];

    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        content = el.text();
        break;
      }
    }

    if (!content) content = $('body').text();
    content = cleanText(content);

    if (content.length < 100) return null;

    if (content.length > CONFIG.maxContentLength) {
      content = content.substring(0, CONFIG.maxContentLength) + '...';
    }

    const summary = content.substring(0, 200).trim() + (content.length > 200 ? '...' : '');
    const url = '/' + relative(scrapedDir, filePath);
    const section = getSection(filePath, scrapedDir);
    const id = generateId(title, filePath, scrapedDir);

    return { id, title, section, url, content, summary };
  } catch (error) {
    log('error', `Error parsing ${filePath}`, { error: error.message });
    return null;
  }
}

// Create backup of current knowledge base
function createBackup() {
  if (!existsSync(CONFIG.outputFile)) return null;

  if (!existsSync(CONFIG.backupDir)) {
    mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = join(CONFIG.backupDir, `knowledge-base-${timestamp}.json`);

  const content = readFileSync(CONFIG.outputFile, 'utf-8');
  writeFileSync(backupFile, content);

  // Keep only last 7 backups
  const backups = readdirSync(CONFIG.backupDir)
    .filter(f => f.endsWith('.json'))
    .sort()
    .reverse();

  for (let i = 7; i < backups.length; i++) {
    const oldBackup = join(CONFIG.backupDir, backups[i]);
    try {
      require('fs').unlinkSync(oldBackup);
    } catch {}
  }

  return backupFile;
}

// Send email notification on failure
function sendFailureNotification(email, error) {
  if (!email) return;

  try {
    // Using system mail command (requires mail to be configured)
    const subject = 'City of Doral Scraper FAILED';
    const body = `The automated content scraper failed at ${new Date().toISOString()}\n\nError: ${error}\n\nPlease check the logs.`;

    execSync(`echo "${body}" | mail -s "${subject}" ${email}`, { stdio: 'ignore' });
    log('info', `Failure notification sent to ${email}`);
  } catch (e) {
    log('warn', 'Could not send email notification', { error: e.message });
  }
}

// Main scraping function
async function runScraper() {
  const startTime = Date.now();
  const logs = [];

  logs.push(log('info', 'Starting automated content scraping'));
  logs.push(log('info', `Source directory: ${CONFIG.scrapedDir}`));
  logs.push(log('info', `Output file: ${CONFIG.outputFile}`));

  try {
    // Create backup
    const backupFile = createBackup();
    if (backupFile) {
      logs.push(log('info', `Created backup: ${backupFile}`));
    }

    // Get all HTML files
    logs.push(log('info', 'Finding HTML files...'));
    const htmlFiles = getHtmlFiles(CONFIG.scrapedDir);
    logs.push(log('info', `Found ${htmlFiles.length} HTML files to process`));

    if (htmlFiles.length === 0) {
      throw new Error('No HTML files found in scraped directory');
    }

    // Parse each file
    const pages = [];
    const sectionCounts = {};
    let processed = 0;
    let skipped = 0;

    for (const file of htmlFiles) {
      const page = parseHtmlFile(file, CONFIG.scrapedDir);

      if (page) {
        pages.push(page);
        sectionCounts[page.section] = (sectionCounts[page.section] || 0) + 1;
        processed++;
      } else {
        skipped++;
      }
    }

    logs.push(log('info', `Parsed ${processed} pages, skipped ${skipped}`));
    logs.push(log('info', 'Pages by section', sectionCounts));

    // Build knowledge base object
    const knowledgeBase = {
      pages,
      sections: Object.keys(sectionCounts).sort(),
      stats: {
        totalPages: pages.length,
        bySection: sectionCounts
      },
      generatedAt: new Date().toISOString(),
      scrapedBy: 'cron-scraper',
      duration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`
    };

    if (dryRun) {
      logs.push(log('info', 'DRY RUN - Would write knowledge base', {
        totalPages: pages.length,
        sections: knowledgeBase.sections
      }));
    } else {
      // Write output
      writeFileSync(CONFIG.outputFile, JSON.stringify(knowledgeBase, null, 2));
      const fileSizeKb = Math.round(statSync(CONFIG.outputFile).size / 1024);
      logs.push(log('info', `Knowledge base saved (${fileSizeKb} KB)`));
    }

    // Save scraper log
    const logData = {
      lastRun: new Date().toISOString(),
      success: true,
      duration: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      pagesProcessed: processed,
      pagesSkipped: skipped,
      totalPages: pages.length,
      logs
    };

    if (!dryRun) {
      writeFileSync(CONFIG.logFile, JSON.stringify(logData, null, 2));
    }

    logs.push(log('info', `Scraping completed successfully in ${logData.duration}`));

    return { success: true, data: logData };

  } catch (error) {
    logs.push(log('error', 'Scraping failed', { error: error.message }));

    // Save error log
    const errorLog = {
      lastRun: new Date().toISOString(),
      success: false,
      error: error.message,
      logs
    };

    if (!dryRun) {
      writeFileSync(CONFIG.logFile, JSON.stringify(errorLog, null, 2));
    }

    // Send notification
    sendFailureNotification(notifyEmail, error.message);

    return { success: false, error: error.message };
  }
}

// Run the scraper
runScraper()
  .then(result => {
    if (result.success) {
      console.log('\n=== SCRAPING COMPLETED SUCCESSFULLY ===');
      process.exit(0);
    } else {
      console.error('\n=== SCRAPING FAILED ===');
      console.error(result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
