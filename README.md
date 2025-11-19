# Safe Browse - Content Filter Extension

A privacy-focused Chrome extension that filters content based on **keyword detection**.

## 🚀 Core Functionality

The extension currently filters content by detecting inappropriate words (profanity/NSFW terms):

1.  **Text Filtering**: Automatically finds and censors profane words on webpages (e.g., replacing them with `****`).
2.  **Image Blocking (Keyword-Based)**: Hides images **only** if their metadata matches NSFW keywords.
    - **Scans**: Alt tags, filenames (src), titles, and surrounding text.
    - _Note: It does not currently analyze the actual image pixels._

## 🔮 Future Roadmap

We are actively working on enhanced detection capabilities:

- **ML Image Detection**: Re-implementing client-side machine learning models (TensorFlow.js) to automatically detect and block explicit images based on visual content (pixels), not just keywords.
- **NLP Enhancement**: Implementing Natural Language Processing (NLP) to better understand context, reducing false positives and catching more subtle offensive language.
- **Offline Model Bundling**: Packaging optimized AI models directly within the extension to bypass CSP restrictions and ensure full offline functionality.

## 🔒 Privacy & Offline Support

- **100% Local**: All detection happens on your device.
- **No Data Collection**: No browsing history or content is sent to any server.
- **Offline Ready**: Works fully without an internet connection.

## 🛠 Installation

1.  **Load Unpacked Extension**:

    - Open Chrome/Brave/Edge and go to `chrome://extensions/`.
    - Enable **Developer mode** (top right).
    - Click **Load unpacked**.
    - Select the `content-filter-extension` folder.

2.  **Verify**:
    - Click the extension icon.
    - Status should show **Protection Active**.

## ⚙️ Configuration

Click the extension icon to open the popup:

- **Protection Active**: Master toggle.
- **Filter Images**: Toggle keyword-based image blocking.
- **Filter Text**: Toggle profanity censoring.
- **Strict Mode**: Uses a larger list of words to filter.
- **Custom Words**: Add your own words to the blocklist.
- **Whitelist**: Allow specific sites to bypass all filters.

## 📄 License

MIT License
