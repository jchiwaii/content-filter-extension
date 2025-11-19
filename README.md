# Safe Browse - Content Filter Extension

A privacy-focused Chrome extension that automatically filters profanity and blocks inappropriate images using keyword detection.

## 🚀 Features

- **Text Filtering**: Automatically detects and censors profanity on webpages.
  - **Comprehensive Database**: Built-in list of thousands of profane words and variations.
  - **Strict Mode**: Optional stricter filtering level.
  - **Custom Words**: Add your own words to filter.
  - **Dynamic Content**: Filters content as it loads (infinite scroll, etc.).
- **Image Blocking (Keyword-Based)**: Hides images with suspicious filenames/attributes (e.g., "nsfw", "porn").
- **Whitelisting**: Easily whitelist trusted sites.
- **Privacy First**: All processing happens locally on your device. No data is sent to any server.
- **Offline Support**: Works fully offline.

## 🛠 Installation

1.  **Load Unpacked Extension**:

    - Open Chrome/Brave/Edge and go to `chrome://extensions/`.
    - Enable **Developer mode** (top right).
    - Click **Load unpacked**.
    - Select the `content-filter-extension` folder.

2.  **Verify**:
    - Click the extension icon in the toolbar.
    - Status should show **Protection Active**.
    - "Profanity Database" should show **✓ Ready**.

## ⚙️ Configuration

Click the extension icon to open the popup:

- **Protection Active**: Master toggle for the extension.
- **Filter Images**: Toggles keyword-based image blocking.
- **Filter Text**: Toggles profanity censoring.
- **Strict Mode**: Enables stricter text filtering.
- **Custom Words**: Add specific words you want to censor.
- **Whitelist**: Add the current site to the allowed list.

## 🔧 Development

- `manifest.json`: Extension configuration (Manifest V3).
- `content.js`: Main logic for text filtering and DOM observation.
- `profanity-data.js`: The database of profane words and regex patterns.
- `ml-detector.js`: Handles image blocking logic (currently keyword-based).
- `background.js`: Service worker for context menus and state management.
- `popup/`: UI for the extension popup.

## 📝 Note on ML Features

Machine learning-based image classification is currently disabled due to browser Content Security Policy (CSP) restrictions in Manifest V3. Image blocking currently relies on robust keyword detection in image attributes (src, alt, title).

## 📄 License

MIT License
