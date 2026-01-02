import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRAPED_DIR = join(__dirname, '..', 'Website Scrapped');
const OUTPUT_FILE_EN = join(__dirname, '..', 'public', 'knowledge-base.json');
const OUTPUT_FILE_ES = join(__dirname, '..', 'public', 'knowledge-base-es.json');

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

// Get all directories containing index.html files
function getDirectoriesWithHtml(dir, dirs = []) {
  const items = readdirSync(dir);

  // Check if this directory has an index.html
  const hasIndexHtml = items.some(item => item === 'index.html');
  if (hasIndexHtml) {
    dirs.push(dir);
  }

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip non-content directories
      if (!item.startsWith('.') && !item.startsWith('files') && !item.includes('WebResource')) {
        getDirectoriesWithHtml(fullPath, dirs);
      }
    }
  }

  return dirs;
}

// Detect if content is English based on title/content patterns
function isEnglishContent($) {
  const title = $('title').text().toLowerCase();
  const bodyText = $('body').text().toLowerCase().substring(0, 2000);

  // English patterns
  const englishPatterns = [
    'city of doral',
    ' the ',
    ' and ',
    ' for ',
    ' with ',
    'residents',
    'businesses',
    'government',
    'services'
  ];

  // Spanish patterns
  const spanishPatterns = [
    'ciudad de doral',
    ' de ',
    ' para ',
    ' con ',
    'residentes',
    'negocios',
    'gobierno',
    'servicios'
  ];

  let englishScore = 0;
  let spanishScore = 0;

  // Check title first (more weight)
  if (title.includes('city of doral')) englishScore += 5;
  if (title.includes('ciudad de doral')) spanishScore += 5;

  // Check body content
  for (const pattern of englishPatterns) {
    if (bodyText.includes(pattern)) englishScore++;
  }
  for (const pattern of spanishPatterns) {
    if (bodyText.includes(pattern)) spanishScore++;
  }

  return englishScore > spanishScore;
}

// Get section from path
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

    // Detect language
    const isEnglish = isEnglishContent($);

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

    // Get clean URL for the live website (directory path, not file path)
    const relPath = relative(SCRAPED_DIR, filePath);
    const dirPath = dirname(relPath);
    // Convert to clean URL path (e.g., "/About/Doral-Facts")
    const url = dirPath === '.' ? '/' : '/' + dirPath;

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
      summary,
      isEnglish
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

// Find best version for each language in a directory
function findLanguageVersions(dirPath) {
  const items = readdirSync(dirPath);
  const htmlFiles = items.filter(f => f.endsWith('.html'));

  let englishFile = null;
  let spanishFile = null;

  for (const file of htmlFiles) {
    const filePath = join(dirPath, file);
    const html = readFileSync(filePath, 'utf-8');
    const $ = load(html);
    const isEnglish = isEnglishContent($);

    if (isEnglish && !englishFile) {
      englishFile = filePath;
    } else if (!isEnglish && !spanishFile) {
      spanishFile = filePath;
    }

    // Found both, no need to continue
    if (englishFile && spanishFile) break;
  }

  return { englishFile, spanishFile };
}

// Main function
async function main() {
  console.log('Starting knowledge base generation (English + Spanish)...\n');
  console.log(`Source: ${SCRAPED_DIR}`);
  console.log(`Output EN: ${OUTPUT_FILE_EN}`);
  console.log(`Output ES: ${OUTPUT_FILE_ES}\n`);

  // Get all directories with HTML files
  console.log('Finding directories with HTML files...');
  const directories = getDirectoriesWithHtml(SCRAPED_DIR);
  console.log(`Found ${directories.length} directories to process\n`);

  // Parse each directory for both languages
  const pagesEN = [];
  const pagesES = [];
  const sectionCountsEN = {};
  const sectionCountsES = {};
  let processed = 0;

  for (const dirPath of directories) {
    const { englishFile, spanishFile } = findLanguageVersions(dirPath);

    // Parse English version
    if (englishFile) {
      const page = parseHtmlFile(englishFile);
      if (page) {
        delete page.isEnglish; // Remove temp field
        pagesEN.push(page);
        sectionCountsEN[page.section] = (sectionCountsEN[page.section] || 0) + 1;
      }
    }

    // Parse Spanish version
    if (spanishFile) {
      const page = parseHtmlFile(spanishFile);
      if (page) {
        delete page.isEnglish; // Remove temp field
        pagesES.push(page);
        sectionCountsES[page.section] = (sectionCountsES[page.section] || 0) + 1;
      }
    }

    processed++;
    if (processed % 50 === 0) {
      process.stdout.write(`\rProcessed: ${processed}/${directories.length}`);
    }
  }

  console.log(`\n\nParsed ${pagesEN.length} English pages, ${pagesES.length} Spanish pages\n`);

  // Build English knowledge base
  const sectionsEN = Object.keys(sectionCountsEN).sort();
  console.log('English pages by section:');
  for (const section of sectionsEN) {
    console.log(`  ${section}: ${sectionCountsEN[section]}`);
  }

  const knowledgeBaseEN = {
    language: 'en',
    pages: pagesEN,
    sections: sectionsEN,
    stats: {
      totalPages: pagesEN.length,
      bySection: sectionCountsEN
    },
    generatedAt: new Date().toISOString()
  };

  writeFileSync(OUTPUT_FILE_EN, JSON.stringify(knowledgeBaseEN, null, 2));
  const fileSizeEnKb = Math.round(statSync(OUTPUT_FILE_EN).size / 1024);
  console.log(`\nEnglish knowledge base saved to: ${OUTPUT_FILE_EN}`);
  console.log(`File size: ${fileSizeEnKb} KB`);

  // Build Spanish knowledge base
  const sectionsES = Object.keys(sectionCountsES).sort();
  console.log('\nSpanish pages by section:');
  for (const section of sectionsES) {
    console.log(`  ${section}: ${sectionCountsES[section]}`);
  }

  const knowledgeBaseES = {
    language: 'es',
    pages: pagesES,
    sections: sectionsES,
    stats: {
      totalPages: pagesES.length,
      bySection: sectionCountsES
    },
    generatedAt: new Date().toISOString()
  };

  writeFileSync(OUTPUT_FILE_ES, JSON.stringify(knowledgeBaseES, null, 2));
  const fileSizeEsKb = Math.round(statSync(OUTPUT_FILE_ES).size / 1024);
  console.log(`\nSpanish knowledge base saved to: ${OUTPUT_FILE_ES}`);
  console.log(`File size: ${fileSizeEsKb} KB`);
}

main().catch(console.error);
