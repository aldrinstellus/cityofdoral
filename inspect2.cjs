const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8888/Home/index.html');
  await page.waitForSelector('.doral-chat-fab');
  await page.click('.doral-chat-fab');
  await page.waitForSelector('.doral-chat-panel');

  // Get computed styles
  const clearBtnStyles = await page.$eval('.doral-chat-clear-btn', el => {
    const styles = window.getComputedStyle(el);
    return {
      width: styles.width,
      height: styles.height,
      display: styles.display,
      color: styles.color,
      background: styles.background
    };
  });

  const clearSvgStyles = await page.$eval('.doral-chat-clear-btn svg', el => {
    const styles = window.getComputedStyle(el);
    return {
      width: styles.width,
      height: styles.height,
      fill: styles.fill,
      display: styles.display,
      visibility: styles.visibility
    };
  });

  console.log('Clear button styles:', clearBtnStyles);
  console.log('Clear SVG styles:', clearSvgStyles);

  // Take screenshot
  await page.screenshot({ path: '/tmp/chat-buttons.png', fullPage: false });
  console.log('Screenshot saved to /tmp/chat-buttons.png');

  await browser.close();
})();
