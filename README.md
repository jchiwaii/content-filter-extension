# Safe Browse - Content Filter Extension

A powerful Chrome/Edge browser extension that automatically blocks inappropriate content including nudity, explicit images, and offensive language - similar to how ad blockers work, but for inappropriate content.

## Features

### 🛡️ Image & Video Filtering
- **Automatic Detection**: Scans images and videos for potentially inappropriate content
- **Skin Tone Analysis**: Uses canvas-based analysis to detect high skin exposure
- **Keyword Detection**: Checks image URLs, alt text, and surrounding context for NSFW keywords
- **Real-time Blocking**: Filters content as pages load and when new content appears

### 📝 Text Filtering
- **Offensive Word Blocking**: Automatically censors profanity and inappropriate language
- **Custom Word Lists**: Add your own words to filter
- **Smart Detection**: Preserves readability while removing offensive content

### ⚙️ Flexible Controls
- **Strict Mode**: Completely hide inappropriate content
- **Blur Mode**: Blur content with option to reveal after confirmation
- **Whitelist Sites**: Exempt trusted websites from filtering
- **Quick Toggle**: Instantly enable/disable protection

### 📊 Statistics Tracking
- Track blocked images and filtered words
- Monitor protected browsing sessions
- View daily blocking statistics

## Installation

### Method 1: Load Unpacked Extension (Development Mode)

1. **Download the Extension**
   - Download all files from this repository
   - Keep them in a folder named `content-filter-extension`

2. **Open Chrome Extension Management**
   - Open Chrome/Edge browser
   - Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `content-filter-extension` folder
   - The extension will appear in your extensions list

4. **Pin the Extension**
   - Click the puzzle piece icon in the browser toolbar
   - Click the pin icon next to "Safe Browse"

### Method 2: Package and Install

1. **Package the Extension**
   - In `chrome://extensions/`, click "Pack extension"
   - Select the extension directory
   - Click "Pack Extension" (creates a .crx file)

2. **Install the .crx File**
   - Drag the .crx file into `chrome://extensions/`
   - Click "Add Extension" when prompted

## Usage

### Basic Operation
1. **Enable Protection**: Click the extension icon and ensure the main toggle is ON
2. **Browse Safely**: The extension automatically filters content on all websites
3. **View Statistics**: Click the extension icon to see blocking statistics

### Configuration Options

#### Filter Settings
- **Filter Images & Videos**: Toggle image/video filtering on/off
- **Filter Offensive Text**: Toggle text filtering on/off
- **Strict Mode**: Hide content completely vs blur with option to reveal
- **Blur Level**: Adjust blur intensity (5-50 pixels)

#### Custom Word Filtering
1. Click the extension icon
2. In "Custom Blocked Words" section, type a word
3. Click "Add" or press Enter
4. Remove words by clicking the × next to them

#### Whitelisting Sites
1. Navigate to a trusted website
2. Click the extension icon
3. Click "Whitelist Current Site"
4. The site will be exempt from filtering

### Context Menu Options
- **Right-click on images**: "Block similar images" - blocks images from the same source
- **Right-click on page**: "Whitelist this website" - adds site to whitelist
- **Right-click anywhere**: "Report inappropriate content" - helps improve filtering

## How It Works

### Image Filtering Algorithm
1. **URL Analysis**: Scans image URLs for NSFW keywords
2. **Context Analysis**: Checks surrounding text for inappropriate terms
3. **Visual Analysis**: 
   - Samples image pixels using canvas
   - Detects skin tone percentages
   - Flags images with >40% skin exposure
4. **Blocking Action**: Either hides or blurs based on settings

### Text Filtering Algorithm
1. **Word Matching**: Uses regex patterns for whole-word matching
2. **Dynamic Replacement**: Replaces offensive words with asterisks
3. **DOM Walking**: Processes all text nodes while preserving structure
4. **Real-time Updates**: Monitors DOM mutations for new content

### Performance Optimizations
- Lazy loading detection with Intersection Observer
- Efficient DOM mutation handling
- Throttled image analysis
- Cached configuration for quick access

## Privacy & Security

- **No Data Collection**: All processing happens locally in your browser
- **No External Servers**: No data is sent to external servers
- **Secure Storage**: Settings stored in Chrome's secure sync storage
- **Cross-Origin Safety**: Respects browser security policies

## Customization

### Adding More Blocked Words
Edit the `offensiveWords` array in `content.js`:
```javascript
const offensiveWords = [
  'word1', 'word2', 'word3',
  // Add more words here
];
```

### Adjusting Skin Detection Sensitivity
Modify the threshold in `content.js`:
```javascript
// Change 40 to higher/lower value
callback(skinPercentage > 40);
```

### Adding Blocked Domains
Add domains to the `blockedDomains` array in `background.js`:
```javascript
const blockedDomains = [
  '*://*.example.com/*',
  // Add more domains here
];
```

## Troubleshooting

### Extension Not Working
1. Ensure "Developer mode" is enabled
2. Check if the extension is enabled in `chrome://extensions/`
3. Refresh the page after enabling
4. Check if the site is whitelisted

### Images Not Being Blocked
1. Verify "Filter Images & Videos" is enabled
2. Some cross-origin images can't be analyzed due to security
3. Try enabling "Strict Mode" for complete blocking

### Performance Issues
1. Disable filtering on trusted sites using whitelist
2. Reduce blur level for better performance
3. Consider disabling text filtering if not needed

## Browser Compatibility

- ✅ Chrome (version 88+)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ✅ Opera (with Chrome extension support)
- ⚠️ Firefox (requires manifest.json modifications for Firefox compatibility)

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension!

## License

This extension is provided as-is for personal use. Modify and distribute as needed.

## Disclaimer

This extension uses heuristic methods for content detection and may not catch all inappropriate content. It may also occasionally flag appropriate content. Parents and organizations should use this as one layer of protection alongside other safety measures.

## Support

For issues, questions, or suggestions:
- Open an issue in the repository
- Check existing issues for solutions
- Review the troubleshooting section above

---

**Safe Browse** - Browse the internet safely and confidently! 🛡️
