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
  const tabUpdates = [];
  const tabReloads = [];
  const tabCreates = [];
  const messages = [];
  const badgeTexts = [];
  const badgeColors = [];

  function area(data) {
    return {
      data,
      async get(keys, callback) {
        let result;
        if (keys === null || keys === undefined) {
          result = { ...data };
        } else if (Array.isArray(keys)) {
          result = Object.fromEntries(keys.map(key => [key, data[key]]));
        } else if (typeof keys === 'string') {
          result = { [keys]: data[keys] };
        } else {
          result = { ...keys, ...Object.fromEntries(Object.keys(keys).map(key => [key, data[key] ?? keys[key]])) };
        }
        callback?.(result);
        return result;
      },
      async set(values, callback) {
        Object.assign(data, values);
        callback?.();
      },
      async remove(keys, callback) {
        for (const key of Array.isArray(keys) ? keys : [keys]) delete data[key];
        callback?.();
      },
      async clear(callback) {
        for (const key of Object.keys(data)) delete data[key];
        callback?.();
      }
    };
  }

  return {
    storage: {
      sync: area(syncData),
      local: area(localData),
      session: area(sessionData),
      onChanged: { addListener: fn => listeners.push(['storageChanged', fn]) }
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
      setBadgeText: details => badgeTexts.push(details.text),
      setBadgeBackgroundColor: details => badgeColors.push(details.color)
    },
    commands: {
      onCommand: { addListener: fn => listeners.push(['command', fn]) }
    },
    tabs: {
      create: details => tabCreates.push(details),
      reload: tabId => tabReloads.push(tabId),
      update: (tabId, details) => tabUpdates.push({ tabId, ...details }),
      query(queryInfo, callback) {
        const tabs = [];
        callback?.(tabs);
        return Promise.resolve(tabs);
      },
      sendMessage(tabId, message, callback) {
        messages.push({ tabId, message });
        callback?.({ success: true });
        return Promise.resolve({ success: true });
      }
    },
    __listeners: listeners,
    __tabUpdates: tabUpdates,
    __tabReloads: tabReloads,
    __tabCreates: tabCreates,
    __messages: messages,
    __badgeTexts: badgeTexts,
    __badgeColors: badgeColors
  };
}

async function createBackgroundContext(initialStorage = {}) {
  const chrome = createChromeMock(initialStorage);
  const context = vm.createContext({
    chrome,
    console: { log: () => {}, warn: console.warn, error: console.error },
    URL,
    Date,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(`${await read('src/background/background.js')}
globalThis.__background = {
  BlocklistData,
  SafeSearch,
  domainMatches,
  normalizeHostname,
  updateStatistics,
  updateBadge,
  defaultConfig
};`, context);
  return { chrome, context, background: context.__background };
}

async function runManifestChecks() {
  const manifest = JSON.parse(await read('manifest.json'));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(await exists(manifest.background.service_worker), true);

  for (const script of manifest.content_scripts.flatMap(entry => entry.js || [])) {
    assert.equal(await exists(script), true, `Missing content script: ${script}`);
    assert.equal(script.startsWith('src/platforms/'), false, `Platform-specific script should not load: ${script}`);
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
  vm.runInContext(await read('src/content/profanity-data.js'), context);
  const { containsProfanity, removeProfanity, PROFANITY_DATA } = context.window;

  assert.equal(containsProfanity('clean sentence'), false);
  assert.equal(containsProfanity('that was shit'), true);
  assert.equal(removeProfanity('that was shit'), 'that was');
  assert.equal(containsProfanity('hello pineapple', ['pineapple']), true);
  assert.equal(containsProfanity('hello pineapple and mango', ['pineapple, mango']), true);
  assert.equal(containsProfanity('hide this custom-phrase now', ['custom phrase']), true);
  assert.equal(removeProfanity('hide this custom-phrase now', ['custom phrase']), 'hide this now');
  assert.equal(containsProfanity('ticket ABC-4821 is visible', ['/ABC-\\d+/i']), true);
  assert.equal(removeProfanity('ticket ABC-4821 is visible', ['/ABC-\\d+/i']), 'ticket is visible');
  assert.equal(containsProfanity('a cybersex portal'), true);

  for (const term of Array.from(PROFANITY_DATA.textWords)) {
    const sample = `before ${term} after`;
    assert.equal(containsProfanity(sample), true, `Runtime word was not detected: ${term}`);
    assert.equal(removeProfanity(sample), 'before after', `Runtime word was not fully removed: ${term}`);

    if (/[\s_-]/.test(term)) {
      for (const separator of ['-', '_', '   ']) {
        const variant = term.replace(/[\s_-]+/g, separator);
        assert.equal(containsProfanity(`before ${variant} after`), true, `Variant was not detected: ${variant}`);
        assert.equal(removeProfanity(`before ${variant} after`), 'before after', `Variant was not removed: ${variant}`);
      }
    }
  }

  const edgeCases = [
    ['uppercase', 'This is SHIT.', 'This is.'],
    ['punctuation', 'Hello shit, world.', 'Hello, world.'],
    ['parentheses', 'Hello (shit) world.', 'Hello world.'],
    ['repeated matches', 'shit, shit and shit!', ', and!'],
    ['underscore boundary', 'before_shit_after', 'before_ _after'],
    ['zero-width evasion', 'before s\u200Bh\u200Bi\u200Bt after', 'before after'],
    ['spaced evasion', 'before s h i t after', 'before after'],
    ['fullwidth evasion', 'before ＦＵＣＫ after', 'before after'],
    ['asterisk evasion', 'before f*ck after', 'before after']
  ];

  for (const [label, input, expected] of edgeCases) {
    assert.equal(containsProfanity(input), true, `${label} was not detected`);
    assert.equal(removeProfanity(input), expected, `${label} was not cleaned correctly`);
  }

  assert.equal(removeProfanity('hello shit '), 'hello ', 'Trailing author whitespace must be preserved');
  assert.equal(removeProfanity(' shit world'), ' world', 'Leading author whitespace must be preserved');
  assert.equal(removeProfanity('shit'), '', 'A fully filtered node should become empty');

  assert.equal(containsProfanity('literal c++ entry', ['c++']), true);
  assert.equal(removeProfanity('literal c++ entry', ['c++']), 'literal entry');
  assert.equal(containsProfanity('unsafe aaaaaaaaaaaaaaaaaaaaa!', ['/(a+)+$/']), false);
  assert.equal(containsProfanity('malformed pattern stays harmless', ['/[invalid/']), false);

  PROFANITY_DATA.patterns.push('[invalid');
  assert.equal(containsProfanity('clean text after invalid pattern'), false);
  PROFANITY_DATA.patterns.push('\\bsourcepattern\\b');
  assert.equal(containsProfanity('sourcepattern should match'), true);

  const safeTexts = [
    'God is good',
    'Jesus loves you',
    'Allah bless this day',
    'This class assessment includes Essex and Sussex.',
    'The assistant passed the assignment with classic glass assets.',
    'Analysis paralysis is a normal phrase.',
    'This is a sex education article.',
    'Adult education resources are useful.',
    'Habari yako rafiki',
    'Dios es bueno',
    'Gracias por todo',
    'Привет мир',
    'こんにちは世界',
    'مرحبا بالعالم'
  ];

  for (const text of safeTexts) {
    assert.equal(containsProfanity(text), false, `False positive: ${text}`);
    assert.equal(removeProfanity(text), text, `Safe text changed: ${text}`);
  }

  const substringSafeTexts = [
    'class assignment assistant assessment',
    'classic glass passage compass',
    'mass grass bass brass',
    'Dickinson and Dickens',
    'Scunthorpe, Penistone, Essex and Sussex',
    'αshitβ',
    'クラシック',
    'home homeowner'
  ];

  for (const text of substringSafeTexts) {
    assert.equal(containsProfanity(text), false, `Substring false positive: ${text}`);
    assert.equal(removeProfanity(text), text, `Substring-safe text changed: ${text}`);
  }

  const blockedTexts = [
    'that was fucking awful',
    'what the fuck is this',
    'this is bullshit',
    'watch porn now',
    'this post is nsfw',
    'nude photos here',
    'onlyfans link',
    'you asshole'
  ];

  for (const text of blockedTexts) {
    assert.equal(containsProfanity(text), true, `Missed profanity: ${text}`);
  }

  assert.equal(removeProfanity('that was fucking awful'), 'that was awful');
}

async function runSafeSearchAndBlocklistChecks() {
  const { chrome, background } = await createBackgroundContext({
    sync: {
      config: {
        customBlocklist: ['example.com'],
        whitelistedDomains: ['allowed.com'],
        blockCategories: ['adult']
      }
    },
    local: {}
  });

  assert.equal(background.normalizeHostname('https://www.Example.com/path'), 'example.com');
  assert.equal(background.domainMatches('sub.example.com', 'example.com'), true);

  const customBlock = await background.BlocklistData.isBlocked('https://www.example.com/path');
  assert.equal(customBlock.blocked, true);
  assert.equal(customBlock.category, 'custom');
  assert.equal(customBlock.reason, 'Manually blocked');

  const adultBlock = await background.BlocklistData.isBlocked('https://www.pornhub.com/');
  assert.equal(adultBlock.blocked, true);
  assert.equal(adultBlock.category, 'adult');

  const googleRedirect = await background.SafeSearch.processSearchUrl('https://www.google.com/search?q=weather');
  assert.equal(googleRedirect.action, 'redirect');
  assert.equal(new URL(googleRedirect.url).searchParams.get('safe'), 'active');

  const blockedSearch = await background.SafeSearch.processSearchUrl('https://www.google.com/search?q=porn');
  assert.equal(blockedSearch.action, 'block');
  assert.equal(blockedSearch.reason, 'blocked_search');

  const ordinaryUrl = await background.SafeSearch.processSearchUrl('https://example.com/?q=porn');
  assert.equal(ordinaryUrl.action, 'none');

  const navListener = chrome.__listeners.find(([type]) => type === 'navigation')?.[1];
  assert.equal(typeof navListener, 'function');

  const {
    chrome: boundaryChrome,
    background: boundaryBackground
  } = await createBackgroundContext({
    sync: { config: {} },
    local: { combinedProfanityWords: ['ass', 'butt plug', 'shit'] }
  });
  assert.equal(await boundaryBackground.SafeSearch.containsBlockedTerm('ass'), true);
  assert.equal(await boundaryBackground.SafeSearch.containsBlockedTerm('buy a butt-plug'), true);
  assert.equal(await boundaryBackground.SafeSearch.containsBlockedTerm('s h i t'), true);
  assert.equal(await boundaryBackground.SafeSearch.containsBlockedTerm('class assignment'), false);
  assert.equal(await boundaryBackground.SafeSearch.containsBlockedTerm('shitake mushrooms'), false);

  boundaryChrome.storage.local.data.combinedProfanityWords = ['butt'];
  const storageListener = boundaryChrome.__listeners.find(([type]) => type === 'storageChanged')?.[1];
  storageListener?.({
    combinedProfanityWords: { oldValue: ['ass'], newValue: ['butt'] }
  }, 'local');
  assert.equal(await boundaryBackground.SafeSearch.containsBlockedTerm('ass'), false);
  assert.equal(await boundaryBackground.SafeSearch.containsBlockedTerm('butt'), true);

  await navListener({ frameId: 0, tabId: 1, url: 'https://sub.example.com/path' });
  assert.equal(chrome.__tabUpdates.length, 1);
  assert.match(chrome.__tabUpdates[0].url, /pages\/blocked\/blocked\.html/);
  assert.equal(chrome.storage.local.data.statistics.sitesBlocked, 1);
  assert.equal(chrome.storage.local.data.dailyStats.sitesBlocked, 1);
  assert.equal(chrome.storage.local.data.siteStats['sub.example.com'], 1);

  await navListener({ frameId: 0, tabId: 2, url: 'https://www.google.com/search?q=weather' });
  assert.equal(new URL(chrome.__tabUpdates[1].url).searchParams.get('safe'), 'active');
  assert.equal(chrome.storage.local.data.statistics.searchesFiltered, 1);

  chrome.storage.sync.data.config.whitelistedDomains = ['example.com'];
  const beforeWhitelistedNav = chrome.__tabUpdates.length;
  await navListener({ frameId: 0, tabId: 3, url: 'https://sub.example.com/path' });
  assert.equal(chrome.__tabUpdates.length, beforeWhitelistedNav);
}

async function runStatisticsAndBadgeChecks() {
  const { chrome, background } = await createBackgroundContext({
    sync: { config: { showBadge: true } },
    local: {}
  });

  await background.updateStatistics({
    wordsFiltered: 1,
    imagesBlocked: 2,
    sitesBlocked: 3,
    searchesFiltered: 4,
    site: 'example.com'
  });

  assert.equal(chrome.storage.local.data.statistics.wordsFiltered, 1);
  assert.equal(chrome.storage.local.data.statistics.imagesBlocked, 2);
  assert.equal(chrome.storage.local.data.statistics.sitesBlocked, 3);
  assert.equal(chrome.storage.local.data.statistics.searchesFiltered, 4);
  assert.equal(chrome.storage.local.data.dailyStats.wordsFiltered, 1);
  assert.equal(chrome.storage.local.data.siteStats['example.com'], 10);
  assert.equal(chrome.storage.local.data.weeklyStats.types[0], 1);
  assert.equal(chrome.storage.local.data.weeklyStats.types[1], 2);
  assert.equal(chrome.storage.local.data.weeklyStats.types[2], 3);
  assert.equal(chrome.storage.local.data.weeklyStats.types[3], 4);
  assert.equal(chrome.__badgeTexts.at(-1), '10');

  chrome.storage.sync.data.config.showBadge = false;
  await background.updateBadge();
  assert.equal(chrome.__badgeTexts.at(-1), '');
}

async function runProfileChecks() {
  const chrome = createChromeMock({
    sync: {
      config: { customWords: ['pineapple'] },
      imageDetectorConfig: { enabled: true, placeholderEnabled: false, checkUrlPatterns: false },
      safeSearchConfig: { enabled: true, blockTerms: false }
    }
  });
  const context = vm.createContext({ chrome, window: {}, Date });
  vm.runInContext(`${await read('src/data/profiles.js')}\nglobalThis.__profiles = FilterProfiles;`, context);

  await context.__profiles.applyProfileSettings({
    filterText: false,
    filterImages: false,
    blockSites: false,
    safeSearch: false
  });

  assert.equal(chrome.storage.sync.data.config.filterText, false);
  assert.equal(chrome.storage.sync.data.config.filterImages, false);
  assert.equal(chrome.storage.sync.data.config.blockSites, false);
  assert.equal(chrome.storage.sync.data.config.safeSearch, false);
  assert.equal(chrome.storage.sync.data.imageDetectorConfig.enabled, false);
  assert.equal(chrome.storage.sync.data.imageDetectorConfig.placeholderEnabled, false);
  assert.equal(chrome.storage.sync.data.imageDetectorConfig.checkUrlPatterns, false);
  assert.equal(chrome.storage.sync.data.safeSearchConfig.enabled, false);
  assert.deepEqual(chrome.storage.sync.data.config.customWords, ['pineapple']);
}

async function runContentWhitelistChecks() {
  const chrome = createChromeMock({
    sync: { config: { whitelistedDomains: ['example.com'] } },
    local: {}
  });
  const context = vm.createContext({
    chrome,
    window: {
      location: { hostname: 'sub.example.com' },
      addEventListener: () => {}
    },
    location: { href: 'https://sub.example.com/page' },
    history: { pushState: () => {}, replaceState: () => {} },
    document: {
      readyState: 'complete',
      visibilityState: 'visible',
      addEventListener: () => {},
      body: {
        nodeType: 1,
        tagName: 'BODY',
        isContentEditable: false,
        childNodes: []
      }
    },
    MutationObserver: class {
      observe() {}
    },
    URL,
    Date,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    console: { log: () => {}, warn: () => {}, error: () => {} }
  });

  vm.runInContext(`${await read('src/content/profanity-data.js')}
${await read('src/content/content.js')}
globalThis.__content = { isWhitelisted, domainMatches, normalizeHostname, config };`, context);

  assert.equal(context.__content.domainMatches('sub.example.com', 'example.com'), true);
  assert.equal(context.__content.isWhitelisted(), true);
}

async function runDynamicTextFilteringChecks() {
  const chrome = createChromeMock({
    sync: { config: { enabled: true, filterText: true, filterImages: false, customWords: ['hidden phrase'] } },
    local: {}
  });
  chrome.runtime.sendMessage = () => Promise.resolve();
  const observerInstances = [];
  const shadowRoot = {
    nodeType: 11,
    childNodes: [],
    querySelectorAll: () => []
  };
  const shadowHost = {
    nodeType: 1,
    tagName: 'SAFE-WIDGET',
    isContentEditable: false,
    childNodes: [],
    shadowRoot,
    querySelectorAll: () => []
  };
  const body = {
    nodeType: 1,
    tagName: 'BODY',
    isContentEditable: false,
    childNodes: [],
    querySelectorAll: selector => selector === '*' ? [shadowHost] : []
  };

  class TestMutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.observations = [];
      observerInstances.push(this);
    }

    observe(root, options) {
      this.observations.push({ root, options });
    }
  }

  const context = vm.createContext({
    chrome,
    window: {
      location: { hostname: 'example.com' },
      addEventListener: () => {}
    },
    location: { href: 'https://example.com/page' },
    history: { pushState: () => {}, replaceState: () => {} },
    document: {
      readyState: 'complete',
      visibilityState: 'visible',
      addEventListener: () => {},
      querySelectorAll: () => [],
      body
    },
    MutationObserver: TestMutationObserver,
    URL,
    Date,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval: () => {},
    requestAnimationFrame: callback => callback(),
    console: { log: () => {}, warn: () => {}, error: () => {} }
  });

  vm.runInContext(`${await read('src/content/profanity-data.js')}
${await read('src/content/content.js')}
globalThis.__content = {
  filterDynamicContent,
  filterTextAttributes,
  setupMutationObserver
};`, context);

  const textObserver = observerInstances.find(observer =>
    observer.observations.some(observation => observation.options.characterData)
  );
  assert.ok(textObserver, 'Text mutation observer was not created');
  assert.equal(
    textObserver.observations.some(observation => observation.root === shadowRoot),
    true,
    'Open shadow roots must be observed'
  );

  const textNode = { nodeType: 3, textContent: 'A hidden-phrase arrived later.' };
  context.__content.filterDynamicContent([{ addedNodes: [textNode] }]);
  assert.equal(textNode.textContent, 'A arrived later.');

  const changedTextNode = { nodeType: 3, textContent: 'This hidden phrase changed in place.' };
  context.__content.filterDynamicContent([{
    type: 'characterData',
    target: changedTextNode,
    addedNodes: []
  }]);
  assert.equal(changedTextNode.textContent, 'This changed in place.');

  const firstRapidNode = { nodeType: 3, textContent: 'First hidden phrase.' };
  const secondRapidNode = { nodeType: 3, textContent: 'Second hidden phrase.' };
  textObserver.callback([{ type: 'childList', addedNodes: [firstRapidNode] }]);
  textObserver.callback([{ type: 'childList', addedNodes: [secondRapidNode] }]);
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(firstRapidNode.textContent, 'First.');
  assert.equal(secondRapidNode.textContent, 'Second.');

  const attributes = {
    placeholder: 'Enter hidden phrase here',
    title: 'A shit title',
    'aria-label': 'Open shit menu'
  };
  const attributeElement = {
    nodeType: 1,
    tagName: 'BUTTON',
    isContentEditable: false,
    childNodes: [],
    querySelectorAll: () => [],
    getAttribute: name => attributes[name] ?? null,
    setAttribute: (name, value) => {
      attributes[name] = value;
    }
  };
  context.__content.filterDynamicContent([{
    type: 'attributes',
    target: attributeElement,
    addedNodes: []
  }]);
  assert.equal(attributes.placeholder, 'Enter here');
  assert.equal(attributes.title, 'A title');
  assert.equal(attributes['aria-label'], 'Open menu');

  const imageAttributes = { title: 'shit image metadata' };
  const imageElement = {
    ...attributeElement,
    tagName: 'IMG',
    getAttribute: name => imageAttributes[name] ?? null,
    setAttribute: (name, value) => {
      imageAttributes[name] = value;
    }
  };
  context.__content.filterTextAttributes(imageElement);
  assert.equal(imageAttributes.title, 'shit image metadata');
}

async function runImageDetectorChecks() {
  const sentMessages = [];
  const chrome = createChromeMock({ sync: { imageDetectorConfig: { enabled: true, placeholderEnabled: false } } });
  chrome.runtime.sendMessage = message => {
    sentMessages.push(message);
    return Promise.resolve();
  };

  const context = vm.createContext({
    chrome,
    window: { location: { hostname: 'images.example.com' } },
    document: {
      querySelectorAll: () => []
    },
    URL,
    MutationObserver: class {
      observe() {}
    },
    setTimeout,
    clearTimeout
  });

  vm.runInContext(`${await read('src/modules/image-detector.js')}\nglobalThis.__imageDetector = ImageDetector;`, context);
  const detector = context.__imageDetector;

  const image = {
    src: 'https://cdn.example.com/nsfw/photo.jpg',
    srcset: '',
    dataset: {},
    attributes: [],
    alt: '',
    title: '',
    className: '',
    id: '',
    complete: true,
    style: {},
    parentElement: null,
    naturalWidth: 640,
    naturalHeight: 480
  };

  detector.config = { ...detector.config, enabled: true, placeholderEnabled: false, checkUrlPatterns: true };
  const result = await detector.processImage(image);
  assert.equal(result.blocked, true);
  assert.equal(image.dataset.blocked, 'true');
  assert.equal(image.style.filter, 'blur(30px)');
  assert.equal(sentMessages.length, 1);
  assert.equal(sentMessages[0].action, 'updateStatistics');
  assert.equal(sentMessages[0].data.imagesBlocked, 1);
  assert.equal(sentMessages[0].data.site, 'images.example.com');

  const safeImage = {
    src: 'https://cdn.example.com/classes/assistant-avatar.jpg',
    srcset: '',
    dataset: {},
    attributes: [],
    alt: 'assistant profile image for adult education resources',
    title: 'sex education article thumbnail',
    className: 'classic-avatar assessment-image',
    id: 'safe-image',
    complete: true,
    style: {},
    parentElement: null,
    naturalWidth: 640,
    naturalHeight: 480
  };

  const safeResult = await detector.processImage(safeImage);
  assert.equal(safeResult.blocked, false);
  assert.equal(safeImage.dataset.blocked, undefined);

  const placeholderParent = {
    insertBefore: () => {
      throw new Error('Image detector should not insert placeholder UI');
    }
  };
  const placeholderProofImage = {
    src: 'https://cdn.example.com/nsfw/photo.jpg',
    srcset: '',
    dataset: {},
    attributes: [],
    alt: '',
    title: '',
    className: '',
    id: '',
    complete: true,
    style: {},
    parentElement: placeholderParent,
    naturalWidth: 640,
    naturalHeight: 480
  };
  detector.config = { ...detector.config, enabled: true, placeholderEnabled: true, checkUrlPatterns: true };
  const placeholderProofResult = await detector.processImage(placeholderProofImage);
  assert.equal(placeholderProofResult.blocked, true);
  assert.equal(placeholderProofImage.style.filter, 'blur(30px)');
}

async function runStaticRegressionChecks() {
  const settings = await read('pages/settings/settings.js');
  const settingsHtml = await read('pages/settings/settings.html');
  const dashboardHtml = await read('pages/dashboard/dashboard.html');
  const contentCss = await read('src/content/content.css');
  const profanityData = await read('src/content/profanity-data.js');
  const background = await read('src/background/background.js');
  const imageDetector = await read('src/modules/image-detector.js');
  const pkg = JSON.parse(await read('package.json'));

  assert.match(settings, /displayBlocklist\(cfg\.customBlocklist \|\| \[\]\)/);
  assert.doesNotMatch(settings, /darkMode|filterLanguage|scheduleEnabled|notificationsEnabled|dailySummary|filterLevel|strictMode/);
  assert.doesNotMatch(settings, /onclick="remove(?:CustomWord|WhitelistDomain|BlocklistDomain)/);
  assert.doesNotMatch(dashboardHtml, /Time Limits Usage|Social Media|Gaming|Streaming/);
  assert.match(pkg.scripts.build, /manifest\.json package\.json README\.md src pages assets/);
  assert.doesNotMatch(pkg.scripts.build, /zip -r safe-browse\.zip \./);
  assert.doesNotMatch(contentCss, /\[data-filtered="true"\]:hover/);
  assert.doesNotMatch(imageDetector, /Show Image|Image Blocked|showPlaceholder/);
  assert.doesNotMatch(settings, /imagePlaceholder/);
  assert.doesNotMatch(settingsHtml, /imagePlaceholder|Show Placeholder/);
  assert.match(profanityData, /chrome\.storage\.local/);
  assert.doesNotMatch(profanityData, /chrome\.storage\.sync\.set\(\{ combinedProfanityWords/);
  assert.match(background, /chrome\.storage\.local\.get\(\['combinedProfanityWords'\]\)/);
}

await runManifestChecks();
await runProfanityChecks();
await runSafeSearchAndBlocklistChecks();
await runStatisticsAndBadgeChecks();
await runProfileChecks();
await runContentWhitelistChecks();
await runDynamicTextFilteringChecks();
await runImageDetectorChecks();
await runStaticRegressionChecks();

console.log('Smoke tests passed');
