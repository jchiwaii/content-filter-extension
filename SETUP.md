# Safe Browse - ML-Powered Content Filter Extension

## 🎯 Overview

Safe Browse is a privacy-focused Chrome extension that uses **client-side machine learning** to automatically detect and filter inappropriate content including:

- **Images & Videos**: Using NSFWJS (TensorFlow.js-based) for accurate detection of explicit content, including soft nudity
- **Text Content**: Comprehensive profanity and offensive language filtering with pattern matching

**Key Features:**
- ✅ **100% Client-Side Processing** - No API calls, your browsing stays private
- ✅ **ML-Powered Image Detection** - Uses NSFWJS with MobileNetV2 model
- ✅ **Comprehensive Word Filtering** - Pattern-based detection for variations and leetspeak
- ✅ **Performance Optimized** - Batch processing, lazy loading, intersection observers
- ✅ **Customizable** - Blur vs. complete hiding, custom word lists, whitelisting
- ✅ **Real-time Statistics** - Track blocked images, filtered words, and sites protected

## 🚀 Installation

### 1. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select this directory (`content-filter-extension`)

### 2. Verify Installation

Once loaded, you should see:
- The Safe Browse icon in your extensions toolbar
- Click the icon to open the popup
- The ML Detection status should show "Loading Model..." then "✓ Ready (NSFWJS)"
- The Profanity Database should show "✓ Ready"

## 🧠 How It Works

### Image Classification (NSFWJS)

The extension uses **NSFWJS**, a client-side NSFW image classifier built on TensorFlow.js:

1. **Model Loading**: On page load, TensorFlow.js (~2.5MB) and NSFWJS (~4.5MB) are loaded from CDN
2. **Classification**: Each image is analyzed using the MobileNetV2Mid model (299x299)
3. **Categories**: Detects 5 categories with configurable thresholds:
   - `Porn` (explicit content) - threshold: 0.5
   - `Hentai` (animated explicit) - threshold: 0.5
   - `Sexy` (soft nudity/suggestive) - threshold: 0.4
   - `Drawing` (illustrations) - threshold: 0.95
   - `Neutral` (safe content) - threshold: 0.95

4. **Performance**:
   - Batch processing (5 images at a time)
   - Intersection Observer for lazy-loaded images
   - Skips small images (<100x100px) likely to be icons
   - Falls back to keyword detection for CORS-blocked images

### Text Filtering (Profanity Detection)

Comprehensive text filtering with:

1. **Multi-level word lists**:
   - Mild profanity
   - Moderate profanity
   - Strong profanity
   - NSFW/adult terms

2. **Pattern matching**:
   - Leetspeak variations (f[u*@#]ck, sh[i!1]t)
   - Censoring patterns (f**k, s**t)
   - Separated letters (f u c k)

3. **Context-aware exceptions**: Words like "assumption", "classic" that contain common substrings

4. **Real-time filtering**: MutationObserver watches for dynamically added content

## 📊 Technical Details

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Chrome Extension                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  popup.js   │  │ background.js│  │ content.js │ │
│  │             │  │              │  │            │ │
│  │  - UI/UX    │  │  - Stats     │  │ - Filter   │ │
│  │  - Settings │  │  - Storage   │  │ - Detect   │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
│                                           │          │
│                   ┌───────────────────────┘          │
│                   │                                  │
│       ┌───────────▼──────────┐  ┌──────────────┐   │
│       │   ml-detector.js     │  │ profanity-   │   │
│       │                      │  │ data.js      │   │
│       │  - NSFWJS loader     │  │              │   │
│       │  - TensorFlow.js     │  │  - Word lists│   │
│       │  - Image classifier  │  │  - Patterns  │   │
│       └──────────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Files Overview

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration, permissions |
| `content.js` | Main content script, orchestrates filtering |
| `ml-detector.js` | ML model loader and image classification |
| `profanity-data.js` | Comprehensive word lists and patterns |
| `background.js` | Service worker, handles stats and storage |
| `popup.js/html/css` | Extension UI and settings |

### Dependencies

All loaded from CDN (client-side only):
- **TensorFlow.js** (4.11.0) - ~2.5MB
- **NSFWJS** (2.4.2) - ~4.5MB (includes MobileNetV2Mid model)

Total initial load: ~7MB (cached by browser after first load)

## ⚙️ Configuration

### Settings Available

1. **Main Toggle**: Enable/disable entire extension
2. **Filter Images & Videos**: Toggle image/video filtering
3. **Filter Offensive Text**: Toggle text content filtering
4. **Strict Mode**: Hide completely vs. blur (click to reveal)
5. **Blur Level**: Adjust blur intensity (5-50px)
6. **Custom Words**: Add your own words to filter
7. **Whitelist**: Bypass filtering on trusted sites

### Adjusting Detection Sensitivity

To modify thresholds, edit `ml-detector.js`:

```javascript
this.config = {
  threshold: 0.5,          // Global threshold (0-1)
  strictThreshold: 0.3,    // Stricter for certain categories
  categories: {
    porn: 0.5,             // Hardcore pornography
    hentai: 0.5,           // Animated pornography
    sexy: 0.4,             // Soft nudity, provocative (lower = stricter)
    drawing: 0.95,         // Most drawings are safe
    neutral: 0.95          // Safe content
  }
};
```

**Lower values = more strict** (more false positives)
**Higher values = more lenient** (may miss some content)

### Extending Word Lists

To add more words, edit `profanity-data.js`:

```javascript
const PROFANITY_DATA = {
  en: [
    // Add your words here
    'word1', 'word2', ...
  ],
  patterns: [
    // Add regex patterns
    /pattern/gi,
    ...
  ]
};
```

For production use, integrate comprehensive datasets:
- [LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words)
- [Surge AI Profanity](https://github.com/surge-ai/profanity)

## 🔒 Privacy & Security

### Privacy-First Design

1. **No External API Calls**: All ML inference happens locally in your browser
2. **No Data Collection**: Nothing is sent to any server
3. **No Tracking**: Your browsing history stays private
4. **Local Storage Only**: Settings stored in Chrome's sync storage

### Content Security Policy

The extension uses `wasm-unsafe-eval` for TensorFlow.js WebAssembly execution. This is required for ML inference and is standard for TensorFlow.js extensions.

### Permissions Explained

- `storage`: Save your settings and statistics
- `activeTab`: Access current tab to filter content
- `webRequest`: Monitor network requests (for future URL filtering)
- `declarativeNetRequest`: Block known adult domains
- `<all_urls>`: Run content filter on all websites (can be customized)

## 📈 Performance Optimization

### Current Optimizations

1. **Batch Processing**: Images processed in batches of 5 with 100ms delays
2. **Lazy Loading**: Intersection Observer with 200px margin
3. **Size Filtering**: Skips images <100x100px
4. **Queuing System**: Prevents duplicate processing
5. **Model Caching**: TensorFlow.js and NSFWJS loaded once per page

### Performance Characteristics

- **First page load**: ~2-3 seconds for model loading
- **Image classification**: ~50-150ms per image
- **Text filtering**: <10ms for typical page
- **Memory usage**: ~150-200MB additional (for ML model)
- **CPU usage**: Spike during classification, idle otherwise

### Tips for Better Performance

1. Use **Strict Mode** (complete hiding) for faster rendering
2. **Whitelist** trusted sites to skip processing
3. Close unused tabs to free up memory
4. For very old/slow devices, consider disabling image filtering

## 🧪 Testing

### Test the Extension

1. **Test Image Detection**:
   - Visit image-heavy sites
   - Check console: `Content Filter: Active and filtering content`
   - Look for ML status: `ML Detector Status: { modelLoaded: true }`

2. **Test Text Filtering**:
   - Visit sites with profanity
   - Words should be replaced with asterisks
   - Check statistics in popup

3. **Test Performance**:
   - Open DevTools > Performance tab
   - Record page load
   - Look for batch processing logs

### Debug Mode

To enable verbose logging, open DevTools console on any page and look for:
- `[ML Detector] ...` - ML model status and classification results
- `[Content Filter] ...` - General filtering operations

## 🔧 Troubleshooting

### ML Model Not Loading

**Symptoms**: Images not being filtered, ML status shows "Not Loaded"

**Solutions**:
1. Check browser console for errors
2. Ensure internet connection (for initial CDN load)
3. Disable other extensions that might conflict
4. Reload the extension in `chrome://extensions/`
5. Try refreshing the page

### False Positives

**Symptoms**: Safe content being filtered

**Solutions**:
1. Adjust thresholds in `ml-detector.js` (increase values)
2. Whitelist specific domains
3. Switch from Strict Mode to Blur Mode
4. Report false positives (see Contributing)

### Performance Issues

**Symptoms**: Slow page loading, high CPU usage

**Solutions**:
1. Enable Strict Mode to reduce rendering overhead
2. Whitelist known-safe domains
3. Increase `BATCH_DELAY` in `content.js`
4. Reduce `BATCH_SIZE` for older devices

### Text Not Being Filtered

**Symptoms**: Profanity visible on pages

**Solutions**:
1. Check if "Filter Offensive Text" is enabled
2. Ensure profanity-data.js is loading (check console)
3. Some text in iframes/shadow DOM may not be filtered
4. Dynamically loaded text should be caught by MutationObserver

## 🌟 Advanced Usage

### Custom Model Integration

To use a different TensorFlow.js model:

1. Edit `ml-detector.js`
2. Replace the NSFWJS load call with your model:

```javascript
// Instead of:
this.model = await nsfwjs.load('MobileNetV2Mid', { size: 299 });

// Use:
this.model = await tf.loadLayersModel('path/to/your/model.json');
```

### Adding More Languages

To add profanity filtering for other languages:

1. Edit `profanity-data.js`
2. Add new language entries:

```javascript
const PROFANITY_DATA = {
  en: [...],
  es: [...], // Spanish
  fr: [...], // French
  // etc.
};
```

3. Update detection logic to check appropriate language

## 📝 Notes for Production

### Recommended Enhancements

1. **Offline Support**: Bundle TensorFlow.js and NSFWJS locally instead of CDN
2. **Full Word Lists**: Integrate complete profanity databases (LDNOOBW, Surge AI)
3. **Model Updates**: Implement auto-update mechanism for ML models
4. **User Feedback**: Add mechanism to report false positives/negatives
5. **Web Workers**: Move ML inference to Web Workers for better performance
6. **IndexedDB**: Store classification cache to avoid reprocessing

### Legal Considerations

- Ensure compliance with applicable content filtering laws
- Provide clear opt-out mechanisms
- Include appropriate disclaimers about filtering accuracy
- Consider parental control regulations if targeting that market

## 🤝 Contributing

### Reporting Issues

If you find bugs or false positives/negatives:
1. Note the specific content type (image URL or text)
2. Include ML confidence scores (check console)
3. Specify your Chrome version and OS
4. Open an issue with details

### Improving Detection

To improve the ML model:
1. Collect false positives/negatives
2. Retrain NSFWJS model with new data
3. Adjust thresholds based on real-world testing
4. Submit pull request with improvements

## 📄 License

MIT License - See LICENSE file

## 🙏 Credits

- **NSFWJS**: https://github.com/infinitered/nsfwjs
- **TensorFlow.js**: https://www.tensorflow.org/js
- **Profanity Lists**: LDNOOBW, Surge AI
- Built with privacy and user safety in mind

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check browser console for debug logs
- Review this README for troubleshooting steps

---

**Remember**: No content filter is 100% accurate. This extension provides an additional layer of protection but should not be solely relied upon for comprehensive content filtering.
