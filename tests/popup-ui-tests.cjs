// Requires Playwright; set CHROMIUM_PATH when using an existing Chromium installation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  try {
    const page = await browser.newPage({ viewport: { width: 380, height: 600 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(request.url()));
    await page.addInitScript(() => {
      const data = {
        sync: { config: { enabled: true, customWords: [], whitelistedDomains: [] } },
        local: { statistics: { wordsFiltered: 1234, sitesBlocked: 12 }, dailyStats: { date: new Date().toDateString(), wordsFiltered: 24 } },
        session: {}
      };
      window.testState = { data, url: 'https://example.com/article', reloads: 0, messages: [] };
      const area = store => ({
        async get(keys) { return Object.fromEntries(keys.map(key => [key, store[key]])); },
        async set(values) { Object.assign(store, structuredClone(values)); },
        async remove(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) delete store[key]; }
      });
      window.chrome = {
        storage: { sync: area(data.sync), local: area(data.local), session: area(data.session) },
        runtime: { getURL: value => value },
        tabs: {
          query(query, callback) {
            const tabs = [{ id: 1, url: window.testState.url }];
            if (callback) return callback(tabs);
            return Promise.resolve(tabs);
          },
          reload() { window.testState.reloads++; },
          async sendMessage(id, message) { window.testState.messages.push(message); }
        }
      };
    });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../pages/popup/popup.html')).href);
    await page.waitForFunction(() => document.querySelector('#totalFiltered').textContent === '1.2K');
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.evaluate(() => document.fonts.check('14px "Host Grotesk"')));
    for (const width of [380]) {
      await page.setViewportSize({ width, height: 600 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.ok(await page.evaluate(() => document.body.scrollHeight <= 600), 'Collapsed popup fits Chrome height');
      assert.ok(await page.evaluate(() => [...document.images].every(image => image.complete && image.naturalWidth)));
      await page.screenshot({ path: '/private/tmp/safe-browse-popup-' + width + '.png', fullPage: true });
    }
    // Chrome may begin measuring a popup from a narrow viewport.
    await page.setViewportSize({ width: 25, height: 600 });
    assert.equal(await page.locator('body').evaluate(element => element.getBoundingClientRect().width), 380);
    assert.equal(await page.locator('html').evaluate(element => element.getBoundingClientRect().width), 380);
    await page.setViewportSize({ width: 380, height: 600 });
    for (const [id, key] of [['filterTextToggle', 'filterText'], ['filterImagesToggle', 'filterImages'], ['safeSearchToggle', 'safeSearch'], ['blockSitesToggle', 'blockSites']]) {
      const toggle = page.locator('#' + id);
      await toggle.uncheck();
      assert.equal(await page.evaluate(key => testState.data.sync.config[key], key), false);
      await toggle.check();
      assert.equal(await page.evaluate(key => testState.data.sync.config[key], key), true);
    }
    assert.equal(await page.evaluate(() => testState.data.sync.imageDetectorConfig.enabled), true);
    assert.equal(await page.evaluate(() => testState.data.sync.safeSearchConfig.enabled), true);
    await page.locator('#pauseBtn').click();
    assert.equal(await page.locator('#statusBadge').textContent(), 'Paused');
    assert.equal(await page.evaluate(() => testState.data.local.isPaused), true);
    await page.locator('#pauseBtn').click();
    assert.equal(await page.locator('#statusBadge').textContent(), 'Active');
    await page.locator('#mainToggle').uncheck();
    assert.equal(await page.locator('#statusBadge').textContent(), 'Disabled');
    assert.equal(await page.locator('#pauseBtn').isDisabled(), true);
    await page.locator('#mainToggle').check();
    await page.locator('#customWordsHeader').click();
    assert.equal(await page.locator('#customWordsHeader').getAttribute('aria-expanded'), 'true');
    const words = ['example phrase', 'a"b<c>', 'x'.repeat(180)];
    await page.locator('#customWordInput').fill(words.join(','));
    await page.locator('#customWordInput').press('Enter');
    assert.deepEqual(await page.evaluate(() => testState.data.sync.config.customWords), words);
    await page.getByRole('button', { name: 'Remove a"b<c>', exact: true }).click();
    assert.equal(await page.locator('.tag').count(), 2);
    await page.locator('#whitelistBtn').click();
    assert.deepEqual(await page.evaluate(() => testState.data.sync.config.whitelistedDomains), ['example.com']);
    await page.locator('#whitelistHeader').click();
    await page.getByRole('button', { name: 'Remove example.com', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => testState.data.sync.config.whitelistedDomains), []);
    assert.equal(await page.locator('#whitelistBtn').getAttribute('aria-pressed'), 'false');
    await page.evaluate(() => { testState.url = 'chrome://extensions'; updateUI(); });
    await page.waitForFunction(() => document.querySelector('#whitelistBtn').disabled);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: '/private/tmp/safe-browse-popup-expanded.png', fullPage: true });
    await page.evaluate(async () => { await PasswordManager.setPassword('test-password'); await checkPasswordLock(); });
    assert.equal(await page.locator('#mainContent').isVisible(), false);
    await page.locator('#passwordInput').fill('wrong');
    await page.locator('#passwordInput').press('Enter');
    await page.waitForFunction(() => !document.querySelector('#passwordError').classList.contains('hidden'));
    await page.screenshot({ path: '/private/tmp/safe-browse-popup-locked.png' });
    await page.locator('#passwordInput').fill('test-password');
    await page.locator('#passwordInput').press('Enter');
    await page.waitForFunction(() => document.querySelector('#passwordLock').classList.contains('hidden'));
    assert.equal(await page.locator('#mainContent').isVisible(), true);
    assert.equal(await page.locator('#passwordInput').inputValue(), '');
    assert.ok(await page.evaluate(() => testState.reloads > 0 && testState.messages.length > 0));
    assert.deepEqual(errors, []);
    console.log('Popup layout, local assets, toggles, pause/resume, lists, escaping, keyboard and password flows passed.');
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
