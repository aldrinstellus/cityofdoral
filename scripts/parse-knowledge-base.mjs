import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRAPED_DIR = join(__dirname, '..', 'Website Scrapped');
const OUTPUT_FILE = join(__dirname, '..', 'public', 'knowledge-base.json');

// Sections to include
const MAIN_SECTIONS = [
  'About',
  'Businesses',
  'Departments',
  'Residents',
  'Visitors',
  'Government-Center',
  'Elected-officials',
  'Online-Services',
  'News-articles',
  'Events-directory'
];

// Files to skip (Spanish, duplicates, utility pages)
function shouldSkipFile(filePath) {
  const name = basename(filePath);
  const lowerName = name.toLowerCase();

  // Skip Spanish versions
  if (lowerName.includes('_spanish') || lowerName.includes('lang_update')) {
    return true;
  }

  // Skip non-index files (usually duplicates or resources)
  if (!lowerName.includes('index.html')) {
    return true;
  }

  return false;
}

// Get all HTML files recursively
function getHtmlFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip non-content directories
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
function getSection(filePath) {
  const relPath = relative(SCRAPED_DIR, filePath);
  const parts = relPath.split('/');
  return parts[0] || 'Other';
}

// Clean text content
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/\n+/g, ' ')           // Remove newlines
    .replace(/\t+/g, ' ')           // Remove tabs
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ') // Remove non-printable chars
    .trim();
}

// Generate slug ID from title and path
function generateId(title, filePath) {
  const relPath = relative(SCRAPED_DIR, filePath);
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
function parseHtmlFile(filePath) {
  try {
    const html = readFileSync(filePath, 'utf-8');
    const $ = load(html);

    // Remove script and style tags
    $('script, style, noscript, iframe').remove();

    // Get title
    let title = $('title').text().trim();
    // Clean title - remove site suffix
    title = title.replace(/\s*[-|]\s*City of Doral.*$/i, '').trim();
    title = title.replace(/\s*[-|]\s*Ciudad de Doral.*$/i, '').trim();

    // Skip if no meaningful title
    if (!title || title.length < 3) {
      return null;
    }

    // Get main content
    let content = '';

    // Try different content selectors (OpenCities CMS structure)
    const contentSelectors = [
      '#main-content',
      '.main-content',
      '.content-main-container',
      '.wysiwyg-content',
      'main',
      'article'
    ];

    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        content = el.text();
        break;
      }
    }

    // Fallback to body if no content found
    if (!content) {
      content = $('body').text();
    }

    // Clean content
    content = cleanText(content);

    // Skip if content is too short (likely navigation-only page)
    if (content.length < 100) {
      return null;
    }

    // Truncate very long content for demo
    const maxContentLength = 5000;
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength) + '...';
    }

    // Generate summary (first 200 chars)
    const summary = content.substring(0, 200).trim() + (content.length > 200 ? '...' : '');

    // Get relative URL
    const url = '/' + relative(SCRAPED_DIR, filePath);

    // Get section
    const section = getSection(filePath);

    // Generate ID
    const id = generateId(title, filePath);

    return {
      id,
      title,
      section,
      url,
      content,
      summary
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

// Main function
async function main() {
  console.log('Starting knowledge base generation...\n');
  console.log(`Source: ${SCRAPED_DIR}`);
  console.log(`Output: ${OUTPUT_FILE}\n`);

  // Get all HTML files
  console.log('Finding HTML files...');
  const htmlFiles = getHtmlFiles(SCRAPED_DIR);
  console.log(`Found ${htmlFiles.length} HTML files to process\n`);

  // Parse each file
  const pages = [];
  const sectionCounts = {};
  let processed = 0;
  let skipped = 0;

  for (const file of htmlFiles) {
    const page = parseHtmlFile(file);

    if (page) {
      pages.push(page);
      sectionCounts[page.section] = (sectionCounts[page.section] || 0) + 1;
      processed++;
    } else {
      skipped++;
    }

    // Progress indicator
    if ((processed + skipped) % 100 === 0) {
      process.stdout.write(`\rProcessed: ${processed + skipped}/${htmlFiles.length}`);
    }
  }

  console.log(`\n\nParsed ${processed} pages, skipped ${skipped}\n`);

  // Get unique sections
  const sections = Object.keys(sectionCounts).sort();

  console.log('Pages by section:');
  for (const section of sections) {
    console.log(`  ${section}: ${sectionCounts[section]}`);
  }

  // Build knowledge base object
  const knowledgeBase = {
    pages,
    sections,
    stats: {
      totalPages: pages.length,
      bySection: sectionCounts
    },
    generatedAt: new Date().toISOString()
  };

  // Write output
  writeFileSync(OUTPUT_FILE, JSON.stringify(knowledgeBase, null, 2));

  const fileSizeKb = Math.round(statSync(OUTPUT_FILE).size / 1024);
  console.log(`\nKnowledge base saved to: ${OUTPUT_FILE}`);
  console.log(`File size: ${fileSizeKb} KB`);
}

main().catch(console.error);
