const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8888/Home/index.html');
  await page.waitForSelector('.doral-chat-fab');
  await page.click('.doral-chat-fab');
  await page.waitForSelector('.doral-chat-panel');

  const clearBtn = await page.$eval('.doral-chat-clear-btn', el => el.innerHTML);
  const closeBtn = await page.$eval('.doral-chat-close-btn', el => el.innerHTML);

  console.log('Clear button innerHTML:', clearBtn);
  console.log('Close button innerHTML:', closeBtn);

  await browser.close();
})();
