const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/aldrin-mac-mini/cityofdoral/reference-screenshots';
const BASE_URL = 'https://doral.lovable.app';
const CREDENTIALS = {
  email: 'admin@cityofdoral.com',
  password: 'admin123'
};

const features = {
  pages: [],
  navigation: [],
  components: [],
  functionality: []
};

async function captureAdmin() {
  console.log('🚀 Starting lovable.app admin capture...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 1. Go to admin
    console.log('📸 Navigating to admin...');
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForTimeout(2000);

    // Screenshot login page
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-login-page.png'),
      fullPage: true
    });
    features.pages.push({ name: 'Login', url: '/admin/auth', screenshot: '01-login-page.png' });

    // 2. Try to sign up first (in case account doesn't exist)
    console.log('🔐 Attempting sign up...');

    // Click Sign Up tab
    const signUpTab = await page.$('button:has-text("Sign Up"), [role="tab"]:has-text("Sign Up")');
    if (signUpTab) {
      await signUpTab.click();
      await page.waitForTimeout(1000);

      // Fill sign up form
      const emailInputs = await page.$$('input[type="email"], input[placeholder*="email" i]');
      const passwordInputs = await page.$$('input[type="password"]');

      if (emailInputs.length > 0 && passwordInputs.length > 0) {
        await emailInputs[0].fill(CREDENTIALS.email);
        await passwordInputs[0].fill(CREDENTIALS.password);

        // Click Sign Up button
        const signUpBtn = await page.$('button:has-text("Sign Up"):not([role="tab"])');
        if (signUpBtn) {
          await signUpBtn.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    // 3. Try to login
    console.log('🔐 Attempting login...');

    // Click Login tab if we're on Sign Up
    const loginTab = await page.$('button:has-text("Login"), [role="tab"]:has-text("Login")');
    if (loginTab) {
      await loginTab.click();
      await page.waitForTimeout(1000);
    }

    // Clear and fill email
    const emailInput = await page.$('input[type="email"], input[placeholder*="email" i]');
    if (emailInput) {
      await emailInput.fill('');
      await emailInput.fill(CREDENTIALS.email);
    }

    // Fill password
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.fill(CREDENTIALS.password);
    }

    // Click Sign In button
    const signInBtn = await page.$('button:has-text("Sign In")');
    if (signInBtn) {
      await signInBtn.click();
      console.log('  Clicked Sign In button');
    }

    // Wait for potential navigation
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Check if we logged in successfully
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);

    // 4. Screenshot whatever page we're on now
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-after-login.png'),
      fullPage: true
    });

    // Check for error messages
    const errorMsg = await page.$('.error, [class*="error"], [class*="Error"], .toast-error, [role="alert"]');
    if (errorMsg) {
      const errorText = await errorMsg.textContent();
      console.log(`  ⚠️ Error message: ${errorText}`);
    }

    // If still on auth page, try direct navigation to dashboard
    if (currentUrl.includes('/auth')) {
      console.log('  Still on auth page, trying direct navigation...');

      // Try navigating directly to common admin paths
      const paths = [
        '/admin/dashboard',
        '/admin',
        '/dashboard'
      ];

      for (const testPath of paths) {
        await page.goto(`${BASE_URL}${testPath}`);
        await page.waitForTimeout(2000);

        if (!page.url().includes('/auth')) {
          console.log(`  ✓ Successfully navigated to ${testPath}`);
          break;
        }
      }
    }

    // 5. Capture current page (hopefully dashboard now)
    const dashboardUrl = page.url();
    console.log(`📸 Capturing current page: ${dashboardUrl}`);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-dashboard.png'),
      fullPage: true
    });
    features.pages.push({ name: 'Dashboard', url: dashboardUrl, screenshot: '03-dashboard.png' });

    // 6. Find all navigation links
    console.log('\n🔍 Looking for navigation...');

    // More comprehensive nav selectors
    const navSelectors = [
      'aside a[href*="/admin"]',
      'nav a[href*="/admin"]',
      '[class*="sidebar"] a',
      '[class*="Sidebar"] a',
      '[class*="nav"] a[href*="/admin"]',
      'a[href*="/admin"]:not([href="/admin/auth"])'
    ];

    let navLinks = [];
    for (const selector of navSelectors) {
      try {
        const links = await page.$$(selector);
        if (links.length > navLinks.length) {
          navLinks = links;
          console.log(`  Found ${links.length} nav items with: ${selector}`);
        }
      } catch (e) {}
    }

    // Collect nav info
    for (const link of navLinks) {
      try {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if (text && text.trim() && href) {
          features.navigation.push({ text: text.trim(), href });
        }
      } catch (e) {}
    }

    console.log('  Nav items:', features.navigation.map(n => `${n.text} (${n.href})`).join(', '));

    // 7. Navigate to each page in navigation
    let screenshotIndex = 4;
    const visitedUrls = new Set();

    for (const navItem of features.navigation) {
      if (navItem.href && !visitedUrls.has(navItem.href)) {
        try {
          console.log(`📸 Visiting: ${navItem.text}`);

          const fullUrl = navItem.href.startsWith('http') ? navItem.href : `${BASE_URL}${navItem.href}`;
          await page.goto(fullUrl);
          await page.waitForTimeout(2000);
          await page.waitForLoadState('networkidle').catch(() => {});

          const filename = `${String(screenshotIndex).padStart(2, '0')}-${navItem.text.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, filename),
            fullPage: true
          });

          features.pages.push({
            name: navItem.text,
            url: navItem.href,
            screenshot: filename
          });

          visitedUrls.add(navItem.href);
          screenshotIndex++;

        } catch (e) {
          console.log(`  ⚠️ Error visiting ${navItem.text}: ${e.message}`);
        }
      }
    }

    // 8. Try common paths even if not in nav
    const commonPaths = [
      { path: '/admin/dashboard', name: 'Dashboard' },
      { path: '/admin/analytics', name: 'Analytics' },
      { path: '/admin/conversations', name: 'Conversations' },
      { path: '/admin/knowledge', name: 'Knowledge' },
      { path: '/admin/content', name: 'Content' },
      { path: '/admin/faqs', name: 'FAQs' },
      { path: '/admin/announcements', name: 'Announcements' },
      { path: '/admin/settings', name: 'Settings' },
      { path: '/admin/users', name: 'Users' }
    ];

    for (const { path: testPath, name } of commonPaths) {
      if (!visitedUrls.has(testPath)) {
        try {
          await page.goto(`${BASE_URL}${testPath}`);
          await page.waitForTimeout(1500);

          const currentUrl = page.url();
          // Only capture if we didn't get redirected to auth
          if (!currentUrl.includes('/auth') && currentUrl.includes(testPath)) {
            const filename = `${String(screenshotIndex).padStart(2, '0')}-${name.toLowerCase()}.png`;
            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR, filename),
              fullPage: true
            });

            features.pages.push({ name, url: testPath, screenshot: filename });
            visitedUrls.add(testPath);
            screenshotIndex++;
            console.log(`  ✓ Captured: ${name}`);
          }
        } catch (e) {}
      }
    }

    // 9. Document UI components on dashboard
    console.log('\n🔍 Analyzing UI components...');
    await page.goto(`${BASE_URL}/admin/dashboard`).catch(() => {});
    await page.waitForTimeout(2000);

    const componentChecks = [
      { selector: 'canvas, [class*="chart"], [class*="Chart"], svg[class*="recharts"]', name: 'Charts' },
      { selector: '[class*="card"], [class*="Card"]', name: 'Cards' },
      { selector: 'table', name: 'Tables' },
      { selector: 'input[type="search"], [class*="search"]', name: 'Search' },
      { selector: 'select, [class*="dropdown"], [class*="Dropdown"]', name: 'Dropdowns' },
      { selector: 'button:has-text("Export")', name: 'Export Button' },
      { selector: '[class*="filter"], [class*="Filter"]', name: 'Filters' },
      { selector: '[role="switch"], [class*="toggle"], [class*="Toggle"]', name: 'Toggles' },
      { selector: '[class*="tab"], [role="tab"]', name: 'Tabs' },
      { selector: '[class*="badge"], [class*="Badge"]', name: 'Badges' },
      { selector: '[class*="avatar"], [class*="Avatar"]', name: 'Avatars' },
      { selector: 'form', name: 'Forms' },
    ];

    for (const check of componentChecks) {
      try {
        const elements = await page.$$(check.selector);
        if (elements.length > 0) {
          features.components.push({ name: check.name, count: elements.length });
          console.log(`  ✓ ${check.name}: ${elements.length}`);
        }
      } catch (e) {}
    }

    // 10. Save summary
    const summary = {
      capturedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      loginSuccessful: !page.url().includes('/auth'),
      ...features
    };

    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'features-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n✅ Capture complete!');
    console.log(`📁 Screenshots: ${SCREENSHOTS_DIR}`);
    console.log(`📊 Pages captured: ${features.pages.length}`);
    console.log(`🧭 Nav items: ${features.navigation.length}`);
    console.log(`🧩 Components: ${features.components.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'error-state.png'),
      fullPage: true
    });
  } finally {
    await browser.close();
  }
}

captureAdmin();
