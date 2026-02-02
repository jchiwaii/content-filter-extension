// Language Detection Module
// Detects page language and applies appropriate profanity filter

const LangDetector = {
  // Supported languages
  supportedLanguages: ['en', 'es', 'fr', 'de', 'pt'],

  // Language data references (loaded dynamically)
  languageData: {
    en: null, // Main PROFANITY_DATA
    es: null, // ES_PROFANITY_DATA
    fr: null, // FR_PROFANITY_DATA
    de: null, // DE_PROFANITY_DATA
    pt: null  // PT_PROFANITY_DATA
  },

  // Cache detected language per domain
  languageCache: new Map(),

  // Initialize with language data
  init() {
    // Link to global language data if available
    if (typeof window !== 'undefined') {
      if (window.PROFANITY_DATA) this.languageData.en = window.PROFANITY_DATA;
      if (window.ES_PROFANITY_DATA) this.languageData.es = window.ES_PROFANITY_DATA;
      if (window.FR_PROFANITY_DATA) this.languageData.fr = window.FR_PROFANITY_DATA;
      if (window.DE_PROFANITY_DATA) this.languageData.de = window.DE_PROFANITY_DATA;
      if (window.PT_PROFANITY_DATA) this.languageData.pt = window.PT_PROFANITY_DATA;
    }
  },

  // Detect page language
  detectPageLanguage() {
    // Check cache first
    const domain = window.location.hostname;
    if (this.languageCache.has(domain)) {
      return this.languageCache.get(domain);
    }

    let detectedLang = 'en'; // Default to English

    // Method 1: Check HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const langCode = htmlLang.split('-')[0].toLowerCase();
      if (this.supportedLanguages.includes(langCode)) {
        detectedLang = langCode;
      }
    }

    // Method 2: Check meta content-language
    if (detectedLang === 'en') {
      const metaLang = document.querySelector('meta[http-equiv="content-language"]');
      if (metaLang) {
        const langCode = metaLang.content.split('-')[0].toLowerCase();
        if (this.supportedLanguages.includes(langCode)) {
          detectedLang = langCode;
        }
      }
    }

    // Method 3: Check og:locale
    if (detectedLang === 'en') {
      const ogLocale = document.querySelector('meta[property="og:locale"]');
      if (ogLocale) {
        const langCode = ogLocale.content.split('_')[0].toLowerCase();
        if (this.supportedLanguages.includes(langCode)) {
          detectedLang = langCode;
        }
      }
    }

    // Method 4: Analyze text content (sample-based)
    if (detectedLang === 'en') {
      detectedLang = this.analyzeTextLanguage();
    }

    // Cache result
    this.languageCache.set(domain, detectedLang);

    return detectedLang;
  },

  // Analyze text to detect language
  analyzeTextLanguage() {
    // Get sample text from page
    const textContent = document.body?.innerText || '';
    const sampleText = textContent.slice(0, 5000).toLowerCase();

    // Language indicators (common words)
    const indicators = {
      es: ['el', 'la', 'los', 'las', 'de', 'en', 'que', 'es', 'un', 'una', 'por', 'con', 'para', 'como', 'pero', 'esta', 'son', 'del', 'al', 'fue'],
      fr: ['le', 'la', 'les', 'de', 'des', 'un', 'une', 'est', 'et', 'en', 'que', 'qui', 'pour', 'dans', 'ce', 'il', 'ne', 'sur', 'pas', 'plus', 'avec'],
      de: ['der', 'die', 'das', 'und', 'ist', 'ein', 'eine', 'nicht', 'mit', 'auf', 'auch', 'sich', 'dem', 'zu', 'den', 'von', 'fur', 'werden', 'haben', 'sind'],
      pt: ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'que', 'um', 'uma', 'para', 'com', 'por', 'mais', 'como', 'foi', 'ser', 'nao', 'esta']
    };

    const scores = {};

    for (const [lang, words] of Object.entries(indicators)) {
      scores[lang] = 0;
      for (const word of words) {
        // Count word boundary matches
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = sampleText.match(regex);
        if (matches) {
          scores[lang] += matches.length;
        }
      }
    }

    // Find highest scoring language
    let maxScore = 0;
    let detectedLang = 'en';

    for (const [lang, score] of Object.entries(scores)) {
      if (score > maxScore && score > 10) { // Minimum threshold
        maxScore = score;
        detectedLang = lang;
      }
    }

    return detectedLang;
  },

  // Get profanity data for a language
  getProfanityData(langCode) {
    this.init();

    if (langCode === 'en') {
      return this.languageData.en || (typeof window !== 'undefined' ? window.PROFANITY_DATA : null);
    }

    return this.languageData[langCode] || null;
  },

  // Get all words to filter for detected language(s)
  getFilterWords(level = 'moderate', includeEnglish = true) {
    this.init();

    const words = [];
    const detectedLang = this.detectPageLanguage();

    // Always include detected language
    const langData = this.getProfanityData(detectedLang);
    if (langData) {
      words.push(...this.getWordsForLevel(langData, level));
    }

    // Optionally include English (for mixed content)
    if (includeEnglish && detectedLang !== 'en') {
      const enData = this.getProfanityData('en');
      if (enData) {
        words.push(...this.getWordsForLevel(enData, level));
      }
    }

    return [...new Set(words)]; // Remove duplicates
  },

  // Get words for specific level from language data
  getWordsForLevel(langData, level) {
    const words = [];

    // Handle English format (PROFANITY_DATA)
    if (langData.en && Array.isArray(langData.en)) {
      if (level === 'all') {
        words.push(...langData.en);
      } else if (langData.severity) {
        switch (level) {
          case 'mild':
            words.push(...(langData.severity.mild || []));
            break;
          case 'moderate':
            words.push(...(langData.severity.mild || []));
            words.push(...(langData.severity.moderate || []));
            break;
          case 'strong':
            words.push(...(langData.severity.mild || []));
            words.push(...(langData.severity.moderate || []));
            words.push(...(langData.severity.strong || []));
            break;
          case 'nsfw':
            words.push(...(langData.severity.nsfw || []));
            break;
        }
      }
    }

    // Handle other language format (words object)
    if (langData.words) {
      switch (level) {
        case 'mild':
          words.push(...(langData.words.mild || []));
          break;
        case 'moderate':
          words.push(...(langData.words.mild || []));
          words.push(...(langData.words.moderate || []));
          break;
        case 'strong':
          words.push(...(langData.words.mild || []));
          words.push(...(langData.words.moderate || []));
          words.push(...(langData.words.strong || []));
          break;
        case 'nsfw':
          words.push(...(langData.words.nsfw || []));
          break;
        case 'all':
          words.push(...(langData.words.mild || []));
          words.push(...(langData.words.moderate || []));
          words.push(...(langData.words.strong || []));
          words.push(...(langData.words.nsfw || []));
          words.push(...(langData.words.slurs || []));
          break;
      }
    }

    return words;
  },

  // Get patterns for detected language
  getFilterPatterns(includeEnglish = true) {
    this.init();

    const patterns = [];
    const detectedLang = this.detectPageLanguage();

    // Get patterns for detected language
    const langData = this.getProfanityData(detectedLang);
    if (langData && langData.patterns) {
      patterns.push(...langData.patterns);
    }

    // Include English patterns
    if (includeEnglish && detectedLang !== 'en') {
      const enData = this.getProfanityData('en');
      if (enData && enData.patterns) {
        patterns.push(...enData.patterns);
      }
    }

    return patterns;
  },

  // Get exceptions for detected language
  getExceptions(includeEnglish = true) {
    this.init();

    const exceptions = [];
    const detectedLang = this.detectPageLanguage();

    // Get exceptions for detected language
    const langData = this.getProfanityData(detectedLang);
    if (langData && langData.exceptions) {
      exceptions.push(...langData.exceptions);
    }

    // Include English exceptions
    if (includeEnglish && detectedLang !== 'en') {
      const enData = this.getProfanityData('en');
      if (enData && enData.exceptions) {
        exceptions.push(...enData.exceptions);
      }
    }

    return [...new Set(exceptions)];
  },

  // Check if text contains profanity in detected language
  containsProfanity(text, level = 'moderate', customWords = []) {
    if (!text) return false;

    const lowerText = text.toLowerCase();
    const exceptions = this.getExceptions();

    // Remove exceptions from text for checking
    let processedText = lowerText;
    for (const exception of exceptions) {
      processedText = processedText.replace(new RegExp(exception, 'gi'), '');
    }

    // Check words
    const words = this.getFilterWords(level);
    for (const word of words) {
      const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'i');
      if (regex.test(processedText)) {
        return true;
      }
    }

    // Check custom words
    for (const word of customWords) {
      const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'i');
      if (regex.test(processedText)) {
        return true;
      }
    }

    // Check patterns
    const patterns = this.getFilterPatterns();
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  },

  // Helper to escape regex
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  // Get language display info
  getLanguageInfo() {
    const detectedLang = this.detectPageLanguage();
    const names = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese'
    };

    return {
      code: detectedLang,
      name: names[detectedLang] || 'Unknown',
      supported: this.supportedLanguages.includes(detectedLang)
    };
  }
};

// Export
if (typeof window !== 'undefined') {
  window.LangDetector = LangDetector;
}
if (typeof module !== 'undefined') {
  module.exports = LangDetector;
}
