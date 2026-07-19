import { chromium, devices } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8765/';

async function measureScroll(page, label) {
  return page.evaluate(({ label }) => {
    const welcome = document.getElementById('welcome');
    const booking = document.getElementById('booking');
    return {
      label,
      scrollY: window.scrollY,
      welcomeTop: welcome ? welcome.getBoundingClientRect().top : null,
      bookingTop: booking ? booking.getBoundingClientRect().top : null,
      activeElement: document.activeElement
        ? `${document.activeElement.tagName}${document.activeElement.id ? `#${document.activeElement.id}` : ''}`
        : 'none',
    };
  }, { label });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const iphone = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iphone,
    locale: 'he-IL',
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  const initial = await measureScroll(page, 'domcontentloaded');
  await page.waitForTimeout(1500);
  const afterLoad = await measureScroll(page, 'after-1.5s');
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const afterReload = await measureScroll(page, 'after-reload');

  await browser.close();

  const results = [initial, afterLoad, afterReload];
  console.log(JSON.stringify(results, null, 2));

  for (const result of results) {
    if (result.scrollY > 120) {
      throw new Error(`${result.label}: scrollY too high (${result.scrollY})`);
    }
    if (result.welcomeTop === null || result.welcomeTop > 180) {
      throw new Error(`${result.label}: welcome section not visible near top (${result.welcomeTop})`);
    }
    if (result.bookingTop !== null && result.bookingTop < 500) {
      throw new Error(`${result.label}: booking section appears too high (${result.bookingTop})`);
    }
  }

  console.log('PASS: iPhone scroll position checks');
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
