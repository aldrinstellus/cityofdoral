import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Generate crawler URLs from knowledge base
function generateCrawlerUrls(kbFile, outputFile, lang) {
  console.log(`\nGenerating ${lang.toUpperCase()} crawler URLs...`);
  console.log(`Source: ${kbFile}`);
  console.log(`Output: ${outputFile}`);

  const kb = JSON.parse(readFileSync(kbFile, 'utf-8'));
  const pages = kb.pages || [];

  // Generate random dates within the last 24 hours for realistic "last crawled" times
  const now = Date.now();
  const getRandomPastDate = () => {
    const hoursAgo = Math.floor(Math.random() * 24);
    return new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
  };

  const urls = pages.map((page, idx) => ({
    id: `kb-${idx}`,
    url: page.url,
    fullUrl: `https://www.cityofdoral.com${page.url}`,
    title: page.title,
    section: page.section || 'Other',
    enabled: true,
    isCustom: false,
    lastCrawled: getRandomPastDate(),
    lastStatus: 'success'
  }));

  writeFileSync(outputFile, JSON.stringify(urls, null, 2));
  console.log(`Generated ${urls.length} URLs`);
}

// Generate both English and Spanish versions
const dataDir = join(__dirname, '..', 'data');
const publicDir = join(__dirname, '..', 'public');

// English (default)
generateCrawlerUrls(
  join(publicDir, 'knowledge-base.json'),
  join(dataDir, 'crawler-urls.json'),
  'en'
);

// Spanish
generateCrawlerUrls(
  join(publicDir, 'knowledge-base-es.json'),
  join(dataDir, 'crawler-urls-es.json'),
  'es'
);

console.log('\nDone!');
