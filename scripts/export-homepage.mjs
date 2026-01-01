import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRAPED_DIR = join(__dirname, '..', 'Website Scrapped');
const OUTPUT_DIR = join(__dirname, '..', 'exports', 'lovable-homepage');
const SOURCE_FILE = join(SCRAPED_DIR, 'Home', 'index.html');

// Create output directories
function setupDirs() {
  mkdirSync(join(OUTPUT_DIR, 'assets', 'images'), { recursive: true });
  mkdirSync(join(OUTPUT_DIR, 'assets', 'events'), { recursive: true });
}

// Copy image assets
function copyAssets() {
  console.log('Copying assets...');

  const assetsToCopy = [
    // Hero images
    { src: 'files/assets/city/v/7/featured-backgrounds/hero-image.jpg', dest: 'assets/images/hero-image.jpg' },
  ];

  // Copy hero image if exists
  for (const asset of assetsToCopy) {
    const srcPath = join(SCRAPED_DIR, asset.src);
    const destPath = join(OUTPUT_DIR, asset.dest);
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`  Copied: ${asset.dest}`);
    } else {
      console.log(`  Not found: ${asset.src}`);
    }
  }

  // Copy event images from the scraped site
  const eventImagesDir = join(SCRAPED_DIR, 'files', 'assets', 'city', 'v', '1', 'events');
  if (existsSync(eventImagesDir)) {
    try {
      const files = readdirSync(eventImagesDir);
      let copied = 0;
      for (const file of files.slice(0, 10)) {
        if (file.endsWith('.jpg') || file.endsWith('.png')) {
          copyFileSync(join(eventImagesDir, file), join(OUTPUT_DIR, 'assets', 'events', file));
          copied++;
        }
      }
      console.log(`  Copied ${copied} event images`);
    } catch (e) {
      console.log('  Could not copy event images:', e.message);
    }
  }
}

// Generate clean CSS
function generateCSS() {
  return `/* City of Doral - Clean CSS for Lovable */
/* Extracted and simplified from OpenCities CMS */

:root {
  --primary-dark: #1e3a5f;
  --primary: #2a4a73;
  --primary-light: #3d5a80;
  --accent: #f59e0b;
  --text-dark: #1f2937;
  --text-light: #6b7280;
  --white: #ffffff;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text-dark);
  line-height: 1.6;
}

/* Grid System */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.grid {
  display: grid;
  gap: 20px;
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }

@media (max-width: 992px) {
  .grid-cols-6 { grid-template-columns: repeat(3, 1fr); }
  .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .grid-cols-6 { grid-template-columns: repeat(2, 1fr); }
  .grid-cols-3 { grid-template-columns: 1fr; }
  .grid-cols-2 { grid-template-columns: 1fr; }
}

/* Header */
.header {
  background: var(--primary-dark);
  color: var(--white);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  height: 50px;
}

.logo img {
  height: 100%;
  width: auto;
}

/* Navigation */
.nav {
  display: flex;
  gap: 30px;
}

.nav a {
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
  padding: 10px 0;
  position: relative;
}

.nav a:hover {
  color: var(--accent);
}

.nav-dropdown {
  position: relative;
}

.nav-dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--white);
  min-width: 220px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  border-radius: 8px;
  padding: 10px 0;
  z-index: 1001;
}

.nav-dropdown:hover .nav-dropdown-menu {
  display: block;
}

.nav-dropdown-menu a {
  display: block;
  padding: 10px 20px;
  color: var(--text-dark);
}

.nav-dropdown-menu a:hover {
  background: var(--gray-100);
  color: var(--primary);
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--white);
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 992px) {
  .nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--primary-dark);
    flex-direction: column;
    padding: 20px;
    gap: 0;
  }

  .nav.active {
    display: flex;
  }

  .mobile-menu-toggle {
    display: block;
  }
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
  background-size: cover;
  background-position: center;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--white);
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(30, 58, 95, 0.7);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 40px 20px;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

/* Search Bar */
.search-bar {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  background: var(--white);
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.search-bar input {
  flex: 1;
  padding: 15px 25px;
  border: none;
  font-size: 16px;
  outline: none;
}

.search-bar button {
  padding: 15px 25px;
  background: var(--accent);
  border: none;
  color: var(--white);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.search-bar button:hover {
  background: #d97706;
}

/* Top Services Section */
.services-section {
  padding: 60px 0;
  background: var(--gray-100);
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 40px;
}

.service-card {
  background: var(--white);
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
  display: block;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.service-icon {
  width: 60px;
  height: 60px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: var(--white);
  font-size: 24px;
}

.service-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
}

/* Events Section */
.events-section {
  padding: 60px 0;
}

.event-card {
  background: var(--white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-3px);
}

.event-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.event-content {
  padding: 20px;
}

.event-date {
  font-size: 0.875rem;
  color: var(--accent);
  font-weight: 600;
  margin-bottom: 8px;
}

.event-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.event-description {
  font-size: 0.875rem;
  color: var(--text-light);
}

/* Footer */
.footer {
  background: var(--primary-dark);
  color: var(--white);
  padding: 60px 0 30px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-bottom: 40px;
}

@media (max-width: 992px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}

.footer h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.footer a {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  display: block;
  margin-bottom: 10px;
}

.footer a:hover {
  color: var(--white);
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 30px;
  text-align: center;
  font-size: 0.875rem;
  opacity: 0.8;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.social-links a {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.social-links a:hover {
  background: var(--accent);
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-accent {
  background: var(--accent);
  color: var(--white);
}

.btn-accent:hover {
  background: #d97706;
}

/* Utility Classes */
.text-center { text-align: center; }
.mt-20 { margin-top: 20px; }
.mb-20 { margin-bottom: 20px; }
.py-40 { padding-top: 40px; padding-bottom: 40px; }
`;
}

// Generate clean JavaScript
function generateJS() {
  return `// City of Doral - Clean JavaScript for Lovable
// Simplified from OpenCities CMS

document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
      nav.classList.toggle('active');
      this.setAttribute('aria-expanded', nav.classList.contains('active'));
    });
  }

  // Search Bar Typing Animation (optional)
  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) {
    const placeholders = [
      'Search for services...',
      'Find building permits...',
      'Explore parks and recreation...',
      'Look up city events...'
    ];
    let currentIndex = 0;

    setInterval(() => {
      currentIndex = (currentIndex + 1) % placeholders.length;
      searchInput.placeholder = placeholders[currentIndex];
    }, 3000);
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Dropdown hover for desktop
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('mouseenter', function() {
      this.querySelector('.nav-dropdown-menu')?.classList.add('active');
    });
    dropdown.addEventListener('mouseleave', function() {
      this.querySelector('.nav-dropdown-menu')?.classList.remove('active');
    });
  });
});
`;
}

// Generate clean HTML
function generateHTML($) {
  // Remove unwanted elements
  $('script[src*="googletagmanager"]').remove();
  $('script[src*="monsido"]').remove();
  $('script[src*="analytics"]').remove();
  $('[id*="monsido"]').remove();
  $('[class*="monsido"]').remove();
  $('[class*="pageassist"]').remove();
  $('input[type="hidden"]').remove();
  $('script:contains("gtag")').remove();
  $('script:contains("BOOMR")').remove();
  $('script:contains("Velaro")').remove();
  $('noscript').remove();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>City of Doral - Official Website</title>
  <meta name="description" content="Welcome to the City of Doral, Florida. Access municipal services, information, and community resources.">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="container header-inner">
      <a href="/" class="logo">
        <img src="https://res.cloudinary.com/dpqp2pvqp/image/upload/v1668702047/doral-logo2_xhl24o.png" alt="City of Doral">
      </a>

      <button class="mobile-menu-toggle" aria-label="Menu" aria-expanded="false">
        <span class="material-symbols-rounded">menu</span>
      </button>

      <nav class="nav">
        <div class="nav-dropdown">
          <a href="#">About</a>
          <div class="nav-dropdown-menu">
            <a href="#">Doral Facts</a>
            <a href="#">History</a>
            <a href="#">City Officials</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a href="#">Businesses</a>
          <div class="nav-dropdown-menu">
            <a href="#">Starting a Business</a>
            <a href="#">Permits & Licenses</a>
            <a href="#">Economic Development</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a href="#">Departments</a>
          <div class="nav-dropdown-menu">
            <a href="#">Building Department</a>
            <a href="#">Parks & Recreation</a>
            <a href="#">Police Department</a>
            <a href="#">Public Works</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a href="#">Residents</a>
          <div class="nav-dropdown-menu">
            <a href="#">Online Services</a>
            <a href="#">Utilities</a>
            <a href="#">Garbage & Recycling</a>
          </div>
        </div>
        <a href="#">Visitors</a>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero" style="background-image: url('assets/images/hero-image.jpg');">
    <div class="hero-content">
      <h1>Welcome to the City of Doral</h1>
      <p>Your gateway to municipal services, community events, and everything Doral has to offer.</p>
      <div class="search-bar">
        <input type="text" placeholder="Search for services...">
        <button type="submit">Search</button>
      </div>
    </div>
  </section>

  <!-- Top Services Section -->
  <section class="services-section">
    <div class="container">
      <h2 class="section-title">Top Services</h2>
      <div class="grid grid-cols-6">
        <a href="#" class="service-card">
          <div class="service-icon">
            <span class="material-symbols-rounded">description</span>
          </div>
          <h3>Building Permits</h3>
        </a>
        <a href="#" class="service-card">
          <div class="service-icon">
            <span class="material-symbols-rounded">payments</span>
          </div>
          <h3>Pay Utilities</h3>
        </a>
        <a href="#" class="service-card">
          <div class="service-icon">
            <span class="material-symbols-rounded">calendar_month</span>
          </div>
          <h3>Events Calendar</h3>
        </a>
        <a href="#" class="service-card">
          <div class="service-icon">
            <span class="material-symbols-rounded">park</span>
          </div>
          <h3>Parks & Recreation</h3>
        </a>
        <a href="#" class="service-card">
          <div class="service-icon">
            <span class="material-symbols-rounded">local_police</span>
          </div>
          <h3>Police Services</h3>
        </a>
        <a href="#" class="service-card">
          <div class="service-icon">
            <span class="material-symbols-rounded">help</span>
          </div>
          <h3>Report an Issue</h3>
        </a>
      </div>
    </div>
  </section>

  <!-- Events Section -->
  <section class="events-section">
    <div class="container">
      <h2 class="section-title">Upcoming Events</h2>
      <div class="grid grid-cols-3">
        <article class="event-card">
          <img src="assets/events/event1.jpg" alt="Community Event" class="event-image" onerror="this.style.background='#e5e7eb'">
          <div class="event-content">
            <div class="event-date">January 15, 2025</div>
            <h3 class="event-title">Community Town Hall Meeting</h3>
            <p class="event-description">Join us for an open discussion about city developments and community initiatives.</p>
          </div>
        </article>
        <article class="event-card">
          <img src="assets/events/event2.jpg" alt="Parks Event" class="event-image" onerror="this.style.background='#e5e7eb'">
          <div class="event-content">
            <div class="event-date">January 20, 2025</div>
            <h3 class="event-title">Doral Park Festival</h3>
            <p class="event-description">Family-friendly festival with food, music, and activities at Doral Central Park.</p>
          </div>
        </article>
        <article class="event-card">
          <img src="assets/events/event3.jpg" alt="Business Event" class="event-image" onerror="this.style.background='#e5e7eb'">
          <div class="event-content">
            <div class="event-date">January 25, 2025</div>
            <h3 class="event-title">Business Networking Breakfast</h3>
            <p class="event-description">Connect with local business owners and entrepreneurs.</p>
          </div>
        </article>
      </div>
      <div class="text-center mt-20">
        <a href="#" class="btn btn-primary">View All Events</a>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>Contact Us</h4>
          <p>City of Doral<br>8401 NW 53rd Terrace<br>Doral, FL 33166</p>
          <p>Phone: (305) 593-6725</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <a href="#">City Directory</a>
          <a href="#">Job Opportunities</a>
          <a href="#">Public Records</a>
          <a href="#">Accessibility</a>
        </div>
        <div>
          <h4>Departments</h4>
          <a href="#">Building Department</a>
          <a href="#">Parks & Recreation</a>
          <a href="#">Police Department</a>
          <a href="#">Public Works</a>
        </div>
        <div>
          <h4>Stay Connected</h4>
          <p>Follow us on social media for the latest updates.</p>
          <div class="social-links">
            <a href="#" aria-label="Facebook">
              <span class="material-symbols-rounded">share</span>
            </a>
            <a href="#" aria-label="Twitter">
              <span class="material-symbols-rounded">share</span>
            </a>
            <a href="#" aria-label="Instagram">
              <span class="material-symbols-rounded">share</span>
            </a>
            <a href="#" aria-label="YouTube">
              <span class="material-symbols-rounded">play_circle</span>
            </a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 City of Doral, Florida. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="script.js"></script>
</body>
</html>`;
}

// Main export function
async function main() {
  console.log('Exporting City of Doral Homepage for Lovable...\n');

  // Setup directories
  setupDirs();
  console.log('Created output directories');

  // Read source HTML
  console.log('Reading source HTML...');
  const html = readFileSync(SOURCE_FILE, 'utf-8');
  const $ = load(html);

  // Generate clean files
  console.log('Generating clean HTML...');
  const cleanHTML = generateHTML($);
  writeFileSync(join(OUTPUT_DIR, 'index.html'), cleanHTML);

  console.log('Generating CSS...');
  const css = generateCSS();
  writeFileSync(join(OUTPUT_DIR, 'styles.css'), css);

  console.log('Generating JavaScript...');
  const js = generateJS();
  writeFileSync(join(OUTPUT_DIR, 'script.js'), js);

  // Copy assets
  await copyAssets();

  console.log('\n✅ Export complete!');
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('\nFiles generated:');
  console.log('  - index.html (clean HTML)');
  console.log('  - styles.css (extracted CSS)');
  console.log('  - script.js (vanilla JS)');
  console.log('  - assets/ (images)');
}

main().catch(console.error);
