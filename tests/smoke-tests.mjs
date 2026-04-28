import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);

async function read(relativePath) {
  return fs.readFile(new URL(relativePath, root), 'utf8');
}

async function exists(relativePath) {
  try {
    await fs.access(new URL(relativePath, root));
    return true;
  } catch {
    return false;
  }
}

function createChromeMock(initial = {}) {
  const syncData = initial.sync || {};
  const localData = initial.local || {};
  const sessionData = initial.session || {};
  const listeners = [];

  function area(data) {
    return {
      data,
      async get(keys) {
        if (keys === null || keys === undefined) return { ...data };
        if (Array.isArray(keys)) {
          return Object.fromEntries(keys.map(key => [key, data[key]]));
        }
        if (typeof keys === 'string') {
          return { [keys]: data[keys] };
        }
        return { ...keys, ...Object.fromEntries(Object.keys(keys).map(key => [key, data[key] ?? keys[key]])) };
      },
      async set(values) {
        Object.assign(data, values);
      },
      async remove(keys) {
        for (const key of Array.isArray(keys) ? keys : [keys]) delete data[key];
      },
      async clear() {
        for (const key of Object.keys(data)) delete data[key];
      }
    };
  }

  return {
    storage: {
      sync: area(syncData),
      local: area(localData),
      session: area(sessionData)
    },
    runtime: {
      getURL: path => `chrome-extension://safe-browse/${path}`,
      onInstalled: { addListener: fn => listeners.push(['installed', fn]) },
      onMessage: { addListener: fn => listeners.push(['message', fn]) },
      openOptionsPage: () => {}
    },
    contextMenus: {
      removeAll: cb => cb?.(),
      create: () => {},
      onClicked: { addListener: fn => listeners.push(['contextMenu', fn]) }
    },
    alarms: {
      create: () => {},
      onAlarm: { addListener: fn => listeners.push(['alarm', fn]) }
    },
    webNavigation: {
      onBeforeNavigate: { addListener: fn => listeners.push(['navigation', fn]) }
    },
    action: {
      setBadgeText: () => {},
      setBadgeBackgroundColor: () => {}
    },
    commands: {
      onCommand: { addListener: fn => listeners.push(['command', fn]) }
    },
    tabs: {
      create: () => {},
      reload: () => {},
      update: () => {},
      query: async () => [],
      sendMessage: async () => {}
    },
    __listeners: listeners
  };
}

async function runManifestChecks() {
  const manifest = JSON.parse(await read('manifest.json'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(await exists(manifest.background.service_worker), true);

  for (const script of manifest.content_scripts.flatMap(entry => entry.js || [])) {
    assert.equal(await exists(script), true, `Missing content script: ${script}`);
  }

  for (const css of manifest.content_scripts.flatMap(entry => entry.css || [])) {
    assert.equal(await exists(css), true, `Missing content stylesheet: ${css}`);
  }

  for (const icon of Object.values(manifest.icons)) {
    assert.equal(await exists(icon), true, `Missing icon: ${icon}`);
  }
}

async function runProfanityChecks() {
  const context = vm.createContext({ window: {} });
  vm.runInContext(await read('profanity-data.js'), context);

  assert.equal(context.window.containsProfanity('clean sentence'), false);
  assert.equal(context.window.containsProfanity('that was shit'), true);
  assert.equal(context.window.removeProfanity('that was shit'), 'that was ');
  assert.equal(context.window.containsProfanity('hello pineapple', ['pineapple']), true);
}

async function runSafeSearchAndBlocklistChecks() {
  const chrome = createChromeMock({
    sync: {
      config: {
        customBlocklist: ['example.com'],
        whitelistedDomains: ['allowed.com'],
        blockCategories: ['adult']
      }
    },
    local: {}
  });
  const context = vm.createContext({
    chrome,
    console: { log: () => {}, warn: console.warn, error: console.error },
    URL,
    Date,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(`${await read('background.js')}\nglobalThis.__background = { BlocklistData, SafeSearch, domainMatches, normalizeHostname };`, context);

  assert.equal(context.__background.normalizeHostname('https://www.Example.com/path'), 'example.com');
  assert.equal(context.__background.domainMatches('sub.example.com', 'example.com'), true);

  const customBlock = await context.__background.BlocklistData.isBlocked('https://www.example.com/path');
  assert.equal(customBlock.blocked, true);
  assert.equal(customBlock.category, 'custom');
  assert.equal(customBlock.reason, 'Manually blocked');

  const adultBlock = await context.__background.BlocklistData.isBlocked('https://www.pornhub.com/');
  assert.equal(adultBlock.blocked, true);
  assert.equal(adultBlock.category, 'adult');

  const googleRedirect = context.__background.SafeSearch.processSearchUrl('https://www.google.com/search?q=weather');
  assert.equal(googleRedirect.action, 'redirect');
  assert.equal(new URL(googleRedirect.url).searchParams.get('safe'), 'active');

  const blockedSearch = context.__background.SafeSearch.processSearchUrl('https://www.google.com/search?q=porn');
  assert.equal(blockedSearch.action, 'block');
  assert.equal(blockedSearch.reason, 'blocked_search');

  const ordinaryUrl = context.__background.SafeSearch.processSearchUrl('https://example.com/?q=porn');
  assert.equal(ordinaryUrl.action, 'none');
}

async function runProfileChecks() {
  const chrome = createChromeMock({ sync: { config: { customWords: ['pineapple'] } } });
  const context = vm.createContext({ chrome, window: {}, Date });
  vm.runInContext(`${await read('data/profiles.js')}\nglobalThis.__profiles = FilterProfiles;`, context);

  await context.__profiles.applyProfileSettings({
    filterText: false,
    filterImages: false,
    blockSites: false,
    safeSearch: false,
    strictMode: false,
    filterLevel: 'nsfw',
    blockCategories: ['adult'],
    blockMildProfanity: false
  });

  assert.equal(chrome.storage.sync.data.config.filterText, false);
  assert.equal(chrome.storage.sync.data.config.filterImages, false);
  assert.equal(chrome.storage.sync.data.config.blockSites, false);
  assert.equal(chrome.storage.sync.data.config.safeSearch, false);
  assert.equal(chrome.storage.sync.data.imageDetectorConfig.enabled, false);
  assert.equal(chrome.storage.sync.data.safeSearchConfig.enabled, false);
  assert.deepEqual(chrome.storage.sync.data.config.customWords, ['pineapple']);
}

async function runStaticRegressionChecks() {
  const settings = await read('settings.js');
  const pkg = JSON.parse(await read('package.json'));

  assert.match(settings, /displayBlocklist\(cfg\.customBlocklist\)/);
  assert.doesNotMatch(settings, /onclick="remove(?:CustomWord|WhitelistDomain|BlocklistDomain)/);
  assert.match(pkg.scripts.build, /\.claude\/\*/);
}

await runManifestChecks();
await runProfanityChecks();
await runSafeSearchAndBlocklistChecks();
await runProfileChecks();
await runStaticRegressionChecks();

console.log('Smoke tests passed');
