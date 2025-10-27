# Content Filter Extension

A Chrome extension that filters inappropriate content using **intelligent pattern-based sentence rewriting** instead of simple asterisk censoring.

## Why This Approach?

Traditional content filters replace offensive words with asterisks (`****`), but your brain can still auto-complete the original word from context. This makes the filtering ineffective.

**This extension rewrites entire sentences** to sound natural while removing inappropriate content.

### The Difference

| Scenario | Traditional Approach | Our Approach |
|----------|---------------------|--------------|
| "This is fucking amazing!" | "This is ****ing amazing!" ❌ | "This is very amazing!" ✅ |
| "What the hell is going on?" | "What the **** is going on?" ❌ | "What on earth is going on?" ✅ |
| "That's damn good work." | "That's **** good work." ❌ | "That's very good work." ✅ |

**See `test-rewriting.html`** for live examples comparing both approaches.

## Features

### 🔤 Intelligent Text Filtering
- **15+ Pattern-Based Rewrites**: Natural sentence reconstruction
- **Context-Aware**: Understands phrases like "what the hell", "as fuck", etc.
- **Custom Word Lists**: Add your own words to filter
- **Smart Fallback**: Words without patterns are simply removed

### 🖼️ Image Filtering
- **NSFW Keyword Detection**: Analyzes image URLs, alt text, and context
- **Blur or Hide**: Choose strict removal or blur with click-to-reveal
- **Real-time Processing**: Filters new content as it loads

### ⚙️ Configuration
- Toggle image/text filtering independently
- Adjust blur levels
- Strict mode for complete hiding
- Domain whitelist for trusted sites
- Custom word management

### 📊 Statistics
- Track blocked images
- Count filtered words
- Monitor browsing protection

## Pattern Examples

The extension uses intelligent pattern matching:

```javascript
// Intensifiers
"fucking good" → "very good"
"damn hard" → "very hard"

// Exclamations
"what the fuck" → "what on earth"
"holy shit" → "holy wow"

// Emphasis
"as fuck" / "af" → "extremely"
"so fucking" → "so very"

// Common phrases
"hell yeah" → "definitely yes"
"hell no" → "definitely not"
```

**Location**: See `content.js:310-408` for all patterns

## Installation

1. **Download this repository**
2. **Open Chrome**: Navigate to `chrome://extensions/`
3. **Enable Developer mode**: Toggle in top-right
4. **Load unpacked**: Click and select this folder
5. **Pin extension**: Click puzzle icon → pin "Content Filter"

## Usage

### Basic Usage
1. Click extension icon to enable filtering
2. Browse normally - filtering happens automatically
3. View statistics in the popup

### Adding Custom Words
1. Click extension icon
2. Type word in "Custom Blocked Words"
3. Click "Add" or press Enter
4. Remove with × button

### Whitelisting Sites
1. Visit trusted website
2. Click extension icon
3. Click "Whitelist Current Site"

## Roadmap

### Phase 1: Pattern-Based Rewriting ✅ (Current)
- Natural sentence rewriting
- Context-aware filtering
- Custom word support

### Phase 2: ML Integration (Next)
- Use TensorFlow.js & NSFWJS for content detection
- Combine ML detection with pattern rewriting
- Maintain natural language output

## Project Structure

```
content-filter-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main filtering logic + rewrite patterns
├── content.css           # Filtered content styles
├── popup.html            # Extension UI
├── popup.js              # UI functionality
├── popup.css             # UI styles
├── background.js         # Service worker
├── blocked.html          # Blocked site page
├── profanity-data.js     # Profanity database
├── ml-detector.js        # ML integration (future)
├── test-rewriting.html   # Feature demonstration
├── lib/                  # ML libraries (for Phase 2)
│   ├── nsfwjs.min.js    # NSFW detection
│   └── tf.min.js        # TensorFlow
└── icons/               # Extension icons
```

## Technical Details

### Key Code Locations

- **Rewrite Patterns**: `content.js:310-408`
- **Sentence Splitting**: `content.js:411-435`
- **Rewrite Logic**: `content.js:438-486`
- **Main Filter**: `content.js:620-683`

### How It Works

1. **Text node detection**: Walk through all text nodes in the page
2. **Profanity check**: Identify nodes with filtered words
3. **Sentence splitting**: Break text into sentences
4. **Pattern matching**: Apply rewrite rules to each sentence
5. **Fallback**: Remove unmatched words entirely
6. **Clean up**: Fix spacing and capitalization

### Adding New Patterns

Edit the `rewritePatterns` array in `content.js`:

```javascript
{
  pattern: /\byour\s+pattern\s+here\b/gi,
  replacement: 'your replacement'
}
```

**Pattern types**:
- Use `\b` for word boundaries
- Use `/gi` flags (global, case-insensitive)
- Capture groups with `$1`, `$2`, etc.

## Design System

The extension uses a clean, professional color palette:

```css
--black: #08090a          /* Deep black */
--rose-quartz: #a7a2a9   /* Muted gray-purple */
--seasalt: #f4f7f5       /* Off-white background */
--davys-gray: #575a5e    /* Medium gray */
--eerie-black: #222823   /* Dark green-black */
```

Applied across:
- Extension popup (`popup.css`)
- Content overlays (`content.css`)
- Blocked page (`blocked.html`)
- Test page (`test-rewriting.html`)

## Privacy & Security

- ✅ **100% Local Processing**: All filtering happens in your browser
- ✅ **No External Servers**: Zero data transmission
- ✅ **No Tracking**: No analytics or telemetry
- ✅ **Secure Storage**: Uses Chrome's encrypted sync storage

## Browser Compatibility

- ✅ Chrome (v88+)
- ✅ Edge (Chromium)
- ✅ Brave
- ✅ Opera

## Development

### Running Tests
Open `test-rewriting.html` in browser to see:
- Side-by-side comparison of old vs new approach
- Examples of pattern rewrites
- Visual demonstration of benefits

### Local Development
1. Make changes to files
2. Go to `chrome://extensions/`
3. Click reload icon on extension
4. Test on web pages

## Contributing

Contributions welcome! Focus areas:
- Adding more rewrite patterns
- Improving sentence detection
- ML integration (Phase 2)
- Performance optimization
- UI/UX improvements

## License

MIT License

## Acknowledgments

Built with the goal of making content filtering more effective by maintaining natural language instead of obvious censorship.

---

**Browse safely with intelligent filtering** 🛡️
