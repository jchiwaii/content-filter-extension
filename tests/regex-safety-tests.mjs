import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = vm.createContext({ window: {} });
vm.runInContext(await readFile(new URL('../src/content/profanity-data.js', import.meta.url), 'utf8'), context);
const evaluate = code => vm.runInContext(code, context, { timeout: 1000 });

const unsafe = [
  '(a+)+$', '(a|aa)+$', 'a+a+$', '.*a.*a$', 'a{999999}',
  '(?=a)a', '(a)\\1', '(?<word>a)\\k<word>', '\\p{Letter}+',
  'a+b', 'a*', 'a?', 'a'.repeat(257),
];
for (const source of unsafe) {
  context.source = source;
  assert.equal(evaluate('buildCustomRegex("/" + source + "/")'), null, source);
  assert.equal(evaluate('buildCustomRegex(new RegExp(source))'), null, source);
  assert.equal(evaluate('buildSourcePatternRegex(source)'), null, source);
  assert.equal(evaluate('buildSourcePatternRegex(new RegExp(source))'), null, source);
}

for (const entry of ['/abc/y', '/abc/v', '/[invalid/', '/unterminated', '/a\\x61/']) {
  context.entry = entry;
  assert.equal(evaluate('buildCustomRegex(entry)'), null, entry);
}

for (const [pattern, text] of [
  ['/ABC-\\d+/i', 'ticket abc-4821'],
  ['/\\bunsafe\\b/i', 'an unsafe page'],
  ['/[a-z][0-9]/i', 'A9'],
  ['/^exact$/', 'exact'],
  ['/a\\+b/', 'a+b'],
  ['/[+*?]/', '+'],
  ['c++', 'learn c++ today'],
  ['custom phrase', 'a custom phrase here'],
]) {
  context.entry = pattern;
  context.input = text;
  assert.equal(evaluate('testRegex(buildCustomRegex(entry), input)'), true, pattern);
}

// Hostile patterns must be rejected before the browser's regex engine sees input.
context.input = 'a'.repeat(100000) + '!';
for (const source of unsafe) {
  context.source = source;
  assert.equal(evaluate('testRegex(buildCustomRegex("/" + source + "/"), input)'), false);
}
assert.equal(evaluate('testRegex(buildCustomRegex("/a+/"), input)'), true);
assert.equal(evaluate('PROFANITY_DATA.patterns.every(pattern => buildSourcePatternRegex(pattern) !== null)'), true);
assert.equal(evaluate('window.containsProfanity("fuck")'), true);
console.log('Regex safety checks passed: restricted syntax, object/string paths, hostile inputs, and built-in patterns.');
