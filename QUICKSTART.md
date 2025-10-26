# Quick Start Guide - Safe Browse Extension

## 🚀 Get Started in 3 Minutes

### Step 1: Install the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Toggle "Developer mode" ON (top right)
3. Click "Load unpacked"
4. Select the `content-filter-extension` folder
5. You should see the Safe Browse extension with a shield icon 🛡️

### Step 2: Verify It's Working

1. Click the extension icon in your toolbar
2. Check the status:
   - **ML Detection**: Should show "✓ Ready (NSFWJS)" after ~2-3 seconds
   - **Profanity Database**: Should show "✓ Ready" immediately

3. Visit any website and open DevTools console (F12)
4. You should see:
   ```
   Content Filter: Active and filtering content
   ML Detector Status: { modelLoaded: true, ... }
   Profanity Detection: Loaded
   ```

### Step 3: Test the Filtering

#### Test Image Filtering:
1. Search for any image-heavy website
2. Inappropriate images should be:
   - **Blurred** (default) with a warning overlay, or
   - **Completely hidden** (if Strict Mode is enabled)
3. Click a blurred image to reveal it (with confirmation)

#### Test Text Filtering:
1. Visit sites with profanity (e.g., Reddit, Twitter)
2. Offensive words should appear as: `****`
3. Statistics in the extension popup will update

## ⚙️ Basic Configuration

### Quick Settings (in Extension Popup)

**Most Common Settings:**

1. **Main Toggle** (top right)
   - Quickly enable/disable entire extension

2. **Strict Mode** (default: ON)
   - ✅ ON = Completely hide inappropriate content
   - ❌ OFF = Blur content (click to reveal)

3. **Blur Level** (default: 20px)
   - Adjust if blur mode is too strong/weak
   - Range: 5px (mild) to 50px (very strong)

4. **Whitelist Current Site**
   - Trust a site and disable filtering on it
   - Click "➕ Whitelist Current Site" button

### Adjusting Sensitivity

For **more strict** filtering (more false positives):
- Edit `ml-detector.js` line 25-30
- Lower the threshold values (e.g., `sexy: 0.3` instead of `0.4`)

For **less strict** filtering (may miss some content):
- Increase threshold values (e.g., `sexy: 0.5` instead of `0.4`)

## 🎯 What Gets Filtered?

### Images & Videos

**Automatically detected and filtered:**
- ✅ Explicit nudity (pornography)
- ✅ Soft nudity (partial nudity, suggestive content)
- ✅ Sexually explicit animations (hentai)
- ✅ Provocative/sexy content
- ⚠️ Some context-dependent content may be caught (adjust thresholds if needed)

**NOT filtered:**
- ❌ Small images (<100x100px) - assumed to be icons/logos
- ❌ CORS-blocked images (uses keyword fallback)
- ❌ Some artistic nudity (may be caught depending on settings)

### Text Content

**Filtered words include:**
- Profanity (mild, moderate, strong)
- Sexual/adult terms
- Common variations and leetspeak (f@ck, sh1t, etc.)
- Custom words you add

**Pattern Examples Caught:**
- `f**k` → `****`
- `f u c k` → `*****`
- `s3x` → `***`
- `@ss` → `***`

## 📊 Monitoring & Statistics

The extension popup shows:

1. **Images Blocked** - Total images filtered
2. **Words Filtered** - Total words censored
3. **Sites Protected** - Number of sites visited with protection active

These statistics persist across browser sessions.

## 🔍 Testing Your Setup

### Test #1: Image Classification

Visit this test page: `https://www.pexels.com/`
- All images should load normally (it's a safe site)
- ML Detector should be active

### Test #2: Text Filtering

Open DevTools console and run:
```javascript
// Create a test element
const div = document.createElement('div');
div.textContent = 'This is a damn test';
document.body.appendChild(div);
```

The word "damn" should be replaced with asterisks within ~1 second.

### Test #3: Performance

1. Open DevTools > Performance tab
2. Click Record
3. Load a page with many images
4. Stop recording
5. Look for batch processing (images processed in groups of 5)

## ⚠️ Common Issues & Quick Fixes

### Issue: ML Model Not Loading

**Symptom**: Extension popup shows "ML Detection: ⚠ Not Loaded"

**Quick Fix:**
1. Refresh the current page (Ctrl+R / Cmd+R)
2. Wait 3-5 seconds for model to download
3. Check internet connection (needed for first load from CDN)
4. If still not working, disable and re-enable the extension

### Issue: Too Many False Positives

**Symptom**: Safe images are being filtered

**Quick Fix:**
1. Open extension popup
2. Turn OFF "Strict Mode" (so you can see what's being filtered)
3. Click blurred images to reveal them
4. If persistent, whitelist the current site
5. For long-term fix, adjust thresholds in `ml-detector.js`

### Issue: Slow Performance

**Symptom**: Pages load slowly, browser feels sluggish

**Quick Fix:**
1. Enable "Strict Mode" (faster than blur)
2. Whitelist known-safe sites (Google, Wikipedia, etc.)
3. Close unused tabs
4. For older devices, consider disabling image filtering

### Issue: Not All Text Is Filtered

**Symptom**: Some profanity still visible

**Explanation**: Text in iframes, shadow DOM, or loaded after MutationObserver may not be caught immediately.

**Quick Fix:**
1. Refresh the page
2. Wait a moment for dynamic content
3. Add specific words to custom word list if they're not in the database

## 🎨 Customization Examples

### Add Custom Blocked Words

1. Open extension popup
2. Find "Custom Blocked Words" section
3. Type a word in the input
4. Click "Add" or press Enter
5. The word will now be filtered across all sites

### Whitelist Multiple Sites

For your frequently visited safe sites:
1. Visit the site (e.g., wikipedia.org)
2. Click extension icon
3. Click "➕ Whitelist Current Site"
4. Repeat for other sites

**Recommended to whitelist:**
- Wikipedia
- Google (search, docs, etc.)
- Your work/school sites
- News sites you trust

### Adjust Blur Appearance

In `content.css`, modify the blur effect:

```css
.content-filter-overlay {
  /* Add background color */
  background: rgba(0, 0, 0, 0.5);

  /* Or add pattern */
  background: repeating-linear-gradient(
    45deg,
    #f00,
    #f00 10px,
    #fff 10px,
    #fff 20px
  );
}
```

## 📱 Mobile/Tablet Support

This extension is for **Chrome desktop only**. For mobile:
- Android: Use Chrome flags or Kiwi Browser (supports extensions)
- iOS: Not supported (Safari extensions work differently)

## 🔄 Updating the Extension

When you make changes:
1. Go to `chrome://extensions/`
2. Find Safe Browse
3. Click the refresh icon 🔄
4. Or toggle the extension OFF then ON
5. Reload any open tabs for changes to take effect

## 📚 Next Steps

- Read [SETUP.md](SETUP.md) for detailed technical information
- Explore the settings to customize filtering
- Add your own custom words and whitelist trusted sites
- Check the console logs to understand what's being filtered

## 🆘 Need Help?

1. Check console for error messages (F12 > Console)
2. Verify ML status in extension popup
3. Try refreshing the page
4. Disable/re-enable the extension
5. Review troubleshooting section in SETUP.md

---

**Enjoy safer browsing! 🛡️**
