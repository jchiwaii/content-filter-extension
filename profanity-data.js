// Comprehensive Profanity Dataset
// Compiled from multiple open-source datasets for maximum coverage
// Sources:
// - https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words
// - https://github.com/surge-ai/profanity
// - Community contributions

// This is a sanitized list for demonstration. In production, you would include
// the full dataset from the repos mentioned above.

const PROFANITY_DATA = {
  // English profanity (partial list for demonstration)
  en: [
    // Mild profanity
    'damn', 'damnit', 'hell', 'crap', 'jerk', 'stupid', 'idiot', 'dumb', 'moron',
    'loser', 'suck', 'sucks', 'sucked', 'sucker',

    // Moderate profanity
    'ass', 'arse', 'asshole', 'bastard', 'bitch', 'dick', 'prick', 'douche',

    // Strong profanity (censored for demonstration)
    'f**k', 'f***ing', 's**t', 'c**t', 'p***y', 'c**k',

    // Sexual content
    'porn', 'porno', 'pornography', 'xxx', 'nsfw', 'nude', 'naked', 'sex',
    'sexy', 'erotic', 'explicit', 'adult', 'hentai', 'r34',

    // Slurs and hate speech (partial - handle with care)
    // Note: These should be included for filtering but are omitted here
    // for demonstration purposes
  ],

  // Pattern-based detection for variations
  patterns: [
    // Leetspeak variations
    /f[u\*@#]ck/gi,
    /sh[i!1]t/gi,
    /[a@4]ss/gi,
    /b[i!1]tch/gi,
    /d[i!1]ck/gi,
    /s[e3]x/gi,

    // Common censoring patterns
    /f\*+k/gi,
    /s\*+t/gi,
    /c\*+t/gi,
    /p\*+n/gi,

    // Separated letters
    /f\s*u\s*c\s*k/gi,
    /s\s*h\s*i\s*t/gi,

    // NSFW image patterns
    /n\s*s\s*f\s*w/gi,
    /p\s*o\s*r\s*n/gi,
    /x\s*x\s*x/gi,
  ],

  // Context-aware exceptions (words that might be legitimate in some contexts)
  exceptions: [
    'assumption', 'assessment', 'assign', 'classic', 'dickens',
    'sussex', 'essex', 'grassland', 'bass', 'glass', 'pass',
    'class', 'mass', 'brass'
  ],

  // Severity levels for graduated filtering
  severity: {
    mild: ['damn', 'hell', 'crap', 'stupid', 'idiot', 'jerk', 'dumb'],
    moderate: ['ass', 'bastard', 'bitch', 'dick', 'suck'],
    strong: ['f**k', 's**t', 'c**t'],
    nsfw: ['porn', 'xxx', 'nude', 'naked', 'sex', 'nsfw', 'explicit', 'adult']
  }
};

// Utility function to check if text contains profanity
function containsProfanity(text, level = 'moderate') {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Check exceptions first
  for (const exception of PROFANITY_DATA.exceptions) {
    if (lowerText.includes(exception)) {
      // Remove exception from text for further checking
      text = text.replace(new RegExp(exception, 'gi'), '');
    }
  }

  // Check word list based on severity level
  const wordsToCheck = [];

  if (level === 'mild') {
    wordsToCheck.push(...PROFANITY_DATA.severity.mild);
  } else if (level === 'moderate') {
    wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate);
  } else if (level === 'strong') {
    wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate, ...PROFANITY_DATA.severity.strong);
  } else if (level === 'all') {
    wordsToCheck.push(...PROFANITY_DATA.en);
  }

  // Add NSFW terms
  wordsToCheck.push(...PROFANITY_DATA.severity.nsfw);

  // Check word boundaries
  const wordBoundaryPattern = new RegExp(`\\b(${wordsToCheck.join('|')})\\b`, 'gi');
  if (wordBoundaryPattern.test(lowerText)) {
    return true;
  }

  // Check patterns
  for (const pattern of PROFANITY_DATA.patterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

// Function to get all profanity matches in text
function findProfanity(text, level = 'moderate') {
  if (!text) return [];

  const matches = [];
  const lowerText = text.toLowerCase();

  // Build word list based on level
  const wordsToCheck = [];

  if (level === 'all') {
    wordsToCheck.push(...PROFANITY_DATA.en);
  } else {
    for (const [severityLevel, words] of Object.entries(PROFANITY_DATA.severity)) {
      wordsToCheck.push(...words);
      if (severityLevel === level) break;
    }
  }

  // Check each word
  for (const word of wordsToCheck) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const wordMatches = text.match(regex);
    if (wordMatches) {
      matches.push(...wordMatches);
    }
  }

  // Check patterns
  for (const pattern of PROFANITY_DATA.patterns) {
    const patternMatches = text.match(pattern);
    if (patternMatches) {
      matches.push(...patternMatches);
    }
  }

  return [...new Set(matches)]; // Remove duplicates
}

// Function to censor profanity in text
function censorProfanity(text, level = 'moderate', replacement = '*') {
  if (!text) return text;

  let censored = text;
  const matches = findProfanity(text, level);

  for (const match of matches) {
    const censor = replacement.repeat(match.length);
    censored = censored.replace(new RegExp(match, 'gi'), censor);
  }

  return censored;
}

// Export for use in content script
window.PROFANITY_DATA = PROFANITY_DATA;
window.containsProfanity = containsProfanity;
window.findProfanity = findProfanity;
window.censorProfanity = censorProfanity;
