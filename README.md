# Safe Browse — Content Filter

A Chrome extension that **removes profanity and inappropriate content** from web pages as you browse — the words are deleted entirely, not replaced with `****`, because your brain reads censored text just as well as the real thing.

All filtering happens locally on your device. No data ever leaves your browser.

---

## What it does

**Removes profanity from text** on any website. Works on regular pages, social media feeds, comments, and dynamically loaded content (infinite scroll, SPAs). If new content loads after the page opens, it gets filtered too.

**Blocks images** with suspicious metadata — checks the image URL, alt text, filename, and surrounding context for known NSFW keywords. If flagged, the image is replaced with a placeholder you can reveal.

**Blocks adult websites** before they load. Redirects known adult domains to a clean "Site Blocked" page.

**Enforces safe search** on Google, Bing, and DuckDuckGo so explicit results don't appear.

**Platform-specific filtering** on YouTube, Twitter/X, Reddit, and Facebook/Instagram — filters comments, post titles, descriptions, bios, trending topics, and NSFW-tagged content with platform-aware logic.

---

## How it works

When you visit a page:
1. The word list loads (1,600+ English terms from two open-source lists merged together)
2. Every text node on the page is scanned with a pre-compiled regex — one pass, fast
3. Matched words are removed and adjacent extra spaces are collapsed
4. A MutationObserver watches for new content and filters it as it appears
5. Your custom words (if any) are checked on every scan too

The word list comes from two sources merged at startup:
- **cuss** project (MIT) — ~1,500 words including leetspeak and censored variants
- **LDNOOBW** (CC-BY-4.0) — ~120 additional terms including multi-word phrases like "blow job", "gang bang", "barely legal"

---

## Installation (unpacked / developer mode)

1. Go to `chrome://extensions/`
2. Turn on **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `content-filter-extension` folder
5. Click the puzzle-piece icon in your toolbar and pin Safe Browse

That's it. Filtering starts immediately on every new page you open.

---

## Using the popup

Click the shield icon in your toolbar to open the control panel.

| Control | What it does |
|---|---|
| Main toggle | Turn all filtering on or off |
| Filter Text | Toggle the word removal on/off |
| Filter Images | Toggle NSFW image blocking on/off |
| Safe Search | Toggle search engine safe mode on/off |
| Block Sites | Toggle the adult domain blocklist on/off |
| Pause 1hr | Suspend everything for one hour |
| Whitelist | Add the current site to your safe list (filtering never runs there) |
| Custom Words | Add your own words to always remove |
| Stats | Open the dashboard to see how much has been filtered |

The **profile buttons** (Child / Teen / Work / Light) are presets that toggle groups of settings at once.

---

## Adding custom words

In the popup, expand **Custom Words**, type the word, and press Enter or click +. It's saved immediately and takes effect on the next page load. Remove a custom word by clicking the × next to it.

Custom words support the same matching as the built-in list — whole-word only, case-insensitive.

---

## Whitelisting a site

Two ways:
- Click **Whitelist** in the popup while on that site
- Right-click anywhere on the page → *Whitelist this site*

To remove a site from the whitelist, expand the Whitelist section in the popup and click × next to the domain.

---

## Settings page

Open via the popup footer or right-click → *Open Settings*. Covers:
- Profile management (create, edit, and switch between custom filter profiles)
- Site blocking categories and custom blocked domains
- Image detection sensitivity
- Parental controls and password protection
- Backup / restore your configuration

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Alt+Shift+S` | Toggle filtering on/off |
| `Alt+Shift+D` | Open the statistics dashboard |

---

## Privacy

- **No network requests.** The extension never calls any external server.
- **No tracking.** Your browsing history, the content you visit, and what gets filtered is never recorded or sent anywhere.
- **Local storage only.** Configuration and statistics stay in your browser's `chrome.storage`.
- **Open source word lists.** Both word lists used (cuss/MIT and LDNOOBW/CC-BY-4.0) are public and auditable.

---

## What it does NOT do

- It does not analyze image pixels (no ML/AI — removed to keep the extension fast and simple)
- It does not block based on page category or AI classification
- It does not filter inside iframes on other origins
- It does not work on Chrome's built-in pages (`chrome://`, `chrome-extension://`)

---

## License

MIT
