import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const code = fs.readFileSync(new URL('../pages/popup/review.js', import.meta.url), 'utf8');
async function setup(state, failTab = false, id = 'extension-id') {
  let ready;
  const nodes = {};
  const opened = [];
  const context = {
    console, Date,
    document: {
      addEventListener(event, callback) { ready = callback; },
      getElementById(name) {
        return nodes[name] ||= { hidden: true, disabled: false, addEventListener(event, callback) { this.click = callback; } };
      }
    },
    chrome: {
      runtime: { id },
      storage: { local: {
        async get() { return state; },
        async set(value) { Object.assign(state, value); },
        async remove(key) { delete state[key]; }
      } },
      tabs: { async create(value) { if (failTab) throw Error('Unavailable'); opened.push(value); } }
    }
  };
  vm.runInNewContext(code, context);
  await ready();
  return { nodes, opened, state };
}
const old = Date.now() - 3 * 86400000;
for (const state of [{}, { installTime: Date.now() }, { installTime: Date.now() + 86400000 }, { installTime: old, reviewPromptChoice: 'dismissed' }, { installTime: old, reviewPromptChoice: 'opened' }]) {
  const { nodes } = await setup(state);
  assert.equal(nodes.reviewPrompt.hidden, true);
}
let result = await setup({ installTime: old });
assert.equal(result.nodes.reviewPrompt.hidden, false);
assert.equal(result.opened.length, 0, 'Showing the prompt must not open the store');
await result.nodes.reviewDismiss.click();
assert.equal(result.state.reviewPromptChoice, 'dismissed');
assert.equal(result.opened.length, 0);
result = await setup({ installTime: old });
await result.nodes.reviewOpen.click();
assert.equal(result.state.reviewPromptChoice, 'opened');
assert.ok(result.opened[0].url.endsWith('/reviews'));
assert.equal(result.nodes.reviewPrompt.hidden, true);
result = await setup({ installTime: old });
assert.equal(result.opened.length, 0);
await result.nodes.reviewStars.click();
assert.equal(result.opened.length, 1);
assert.ok(result.opened[0].url.endsWith('/reviews'));
result = await setup({ installTime: old }, true);
await result.nodes.reviewOpen.click();
assert.equal(result.state.reviewPromptChoice, undefined);
assert.equal(result.nodes.reviewError.hidden, false);
assert.equal(result.nodes.reviewOpen.disabled, false);
result = await setup({ installTime: old }, false, '');
assert.equal(Object.keys(result.nodes).length, 0);
const background = fs.readFileSync(new URL('../src/background/background.js', import.meta.url), 'utf8');
const registration = background.slice(background.indexOf("const UNINSTALL_FEEDBACK_URL"), background.indexOf("chrome.runtime.onStartup?"));
for (const url of ['', 'https://tally.so/r/example', 'javascript:alert(1)', 'https://tally.so/' + 'a'.repeat(1100)]) {
  const calls = [];
  const context = vm.createContext({ URL, console: { warn() {} }, chrome: { runtime: { async setUninstallURL(url) { calls.push(url); } } } });
  vm.runInContext(registration.replace(/const UNINSTALL_FEEDBACK_URL = '[^']*'/, 'const UNINSTALL_FEEDBACK_URL = ' + JSON.stringify(url)), context);
  await vm.runInContext('registerUninstallFeedback()', context);
  assert.equal(calls.length, !url || url === 'https://tally.so/r/example' ? 1 : 0);
}
console.log('Feedback timing, dismissal, review redirect, failure recovery, preview and uninstall URL tests passed.');
