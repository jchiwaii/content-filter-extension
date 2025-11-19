// Comprehensive Profanity Database
// For content filtering and parental control purposes
// Sources: Common profanity filtering standards, content moderation best practices
// Note: This is a professional content filtering database used for blocking inappropriate content

const PROFANITY_DATA = {
  // English profanity - organized by severity
  en: [
    // MILD - Common informal language (may be acceptable in some contexts)
    'damn', 'damnit', 'damned', 'dammit',
    'hell', 'heck', 'hellish',
    'crap', 'crappy', 'crapped', 'crapping',
    'piss', 'pissed', 'pissing',
    'suck', 'sucks', 'sucked', 'sucker', 'sucking',
    'stupid', 'idiot', 'idiotic', 'moron', 'moronic', 'dumb', 'dumbass',
    'jerk', 'jerky', 'jackass',
    'screw', 'screwed', 'screwing',
    'butt', 'butthead',
    'fart', 'farting', 'farted',
    'boob', 'boobs', 'booby',

    // MODERATE - Common profanity (generally inappropriate)
    'ass', 'arse', 'arsehole', 'asshole', 'assholes', 'asshat', 'asswipe',
    'bastard', 'bastards',
    'bitch', 'bitches', 'bitching', 'bitchy', 'biotch',
    'bollocks', 'bollock',
    'bugger', 'buggered', 'buggering',
    'cock', 'cocks', 'cocky', 'cocksucker',
    'cunt', 'cunts', 'cunty',
    'dick', 'dicks', 'dickhead', 'dickwad',
    'douche', 'douchebag', 'douchey',
    'fag', 'faggot', 'fags',
    'prick', 'pricks',
    'pussy', 'pussies',
    'shit', 'shitty', 'shite', 'shitting', 'shitted', 'shithead', 'shitstorm',
    'slut', 'slutty', 'sluts',
    'tit', 'tits', 'titties', 'titty',
    'twat', 'twats',
    'whore', 'whores', 'whorish',

    // STRONG - Severe profanity (always inappropriate)
    'fuck', 'fucked', 'fucker', 'fucking', 'fuckers', 'fucks', 'fuckface', 'fuckhead',
    'motherfucker', 'motherfucking', 'motherfuckers',
    'bullshit',
    'shitface',
    'assfuck', 'assfucker',
    'clusterfuck',
    'fuckwit', 'fuckwad', 'fuckstick',

    // SEXUAL CONTENT - Explicit sexual terms
    'porn', 'porno', 'pornography', 'pornographic', 'porns',
    'xxx', 'xxxx',
    'nsfw',
    'nude', 'nudes', 'nudity', 'naked', 'nakedness',
    'sex', 'sexy', 'sexual', 'sexually',
    'erotic', 'erotica',
    'explicit',
    'adult', 'adults',
    'hentai',
    'r34', 'rule34',
    'milf', 'dilf',
    'anal',
    'blowjob', 'bj',
    'handjob',
    'orgasm', 'cumming',
    'fetish', 'kinky', 'kink',
    'bdsm',
    'bondage',
    'masturbate', 'masturbation', 'masturbating',
    'penis', 'vagina', 'vulva',
    'dildo', 'vibrator',
    'horny',
    'arousal', 'aroused',

    // SLURS AND HATE SPEECH (racial, homophobic, etc.)
    // Note: Including for filtering purposes only
    'nigger', 'nigga', 'negro',
    'chink', 'gook',
    'spic', 'wetback',
    'kike',
    'retard', 'retarded', 'retards',
    'tranny',
    'dyke',
    'homo', 'homos', 'homosexual',

    // BODY PARTS (vulgar terms)
    'penis', 'cock', 'dick', 'prick', 'schlong',
    'vagina', 'pussy', 'cunt', 'twat',
    'testicles', 'balls', 'nuts',
    'breast', 'tit', 'boob', 'tits', 'boobs',
    'ass', 'butt', 'arse',
    'anus', 'asshole',

    // DRUG REFERENCES
    'cocaine', 'coke',
    'heroin', 'smack',
    'meth', 'methamphetamine',
    'weed', 'marijuana', 'pot', 'ganja',
    'crack',
    'ecstasy', 'molly',
    'lsd', 'acid',

    // VIOLENCE AND THREATS
    'kill', 'killing', 'killed', 'killer',
    'murder', 'murderer', 'murdered',
    'rape', 'raped', 'raping', 'rapist',
    'torture', 'tortured', 'torturing',
    'die', 'dying', 'death',

    // MEDICAL/GROSS (context-dependent)
    'poop', 'shit', 'crap', 'feces',
    'pee', 'piss', 'urine',
    'vomit', 'puke',
    'snot',
    'blood',
    'gore', 'gory',

    // INTERNET SLANG (often inappropriate)
    'fml',
    'wtf', 'wth',
    'stfu',
    'milf', 'dilf',
    'thot',
    'simp',
    'fap', 'fapping',

    // ALTERNATIVE SPELLINGS AND CENSORED VERSIONS
    'fuk', 'fuc', 'fck', 'phuck', 'phuk',
    'sht', 'shyt', 'chit',
    'cnt',
    'btch', 'b1tch', 'biatch',
    'azz', 'asz',
    'dik', 'dck',
    'pron',
    'pr0n',
    'bewbs',
  ],

  // Pattern-based detection for variations
  patterns: [
    // Leetspeak and character substitutions
    /f[u@#0]c?k/gi,
    /sh[i!1]t/gi,
    /[a@4]ss/gi,
    /[a@4]ssh[o0]le/gi,
    /b[i!1]tc?h/gi,
    /d[i!1]c?k/gi,
    /s[e3]x/gi,
    /[ck][o0][ck]k/gi,
    /p[u0]ss[yi]/gi,
    /tw[a@4]t/gi,
    /wh[o0]r[e3]/gi,
    /sl[u0]t/gi,

    // Common censoring patterns (properly escaped)
    /f\*\*k/gi,
    /f\*ck/gi,
    /s\*\*t/gi,
    /sh\*t/gi,
    /c\*\*t/gi,
    /b\*tch/gi,
    /d\*ck/gi,
    /p\*rn/gi,
    /a\*\*hole/gi,

    // Separated/spaced letters
    /f\s*u\s*c\s*k/gi,
    /s\s*h\s*i\s*t/gi,
    /b\s*i\s*t\s*c\s*h/gi,
    /d\s*i\s*c\s*k/gi,

    // NSFW image patterns
    /n\s*s\s*f\s*w/gi,
    /p\s*o\s*r\s*n/gi,
    /x\s*x\s*x/gi,
    /x{3,}/gi,

    // Combined patterns
    /fuc?k(ing|ed|er|s)?/gi,
    /sh[i!]t(ty|head|face)?/gi,
    /b[i!]tc?h(y|ing|es)?/gi,

    // Sexual patterns
    /sex(y|ual|ually)?/gi,
    /porn(o|ography|ographic)?/gi,
    /nude(s|ity)?/gi,
    /naked(ness)?/gi,

    // Multiple consecutive special characters (often used to evade filters)
    /(.)\1{4,}/gi, // Same character repeated 5+ times (e.g., "aaaaa")
  ],

  // Context-aware exceptions (words that might be legitimate in some contexts)
  exceptions: [
    // Common words that contain profanity substrings
    'assumption', 'assumptions',
    'assessment', 'assessments', 'assess', 'assessing',
    'assign', 'assignment', 'assigned', 'assigns',
    'assistance', 'assistant', 'assist', 'assisting',
    'associate', 'associated', 'association',
    'class', 'classes', 'classic', 'classical', 'classify',
    'mass', 'masses', 'massive',
    'pass', 'passed', 'passing', 'passenger', 'passport',
    'grass', 'grassland',
    'bass', 'bassist',
    'brass',
    'glass', 'glasses',
    'dickens', 'dickinson',
    'sussex', 'essex', 'middlesex', 'wessex',
    'cassette', 'cassettes',
    'harass', 'harassment', 'harassing',
    'embarrass', 'embarrassed', 'embarrassing',
    'compass',
    'trespass', 'trespassing',
    'surpass', 'surpassing',
    'bypass',
    'assassin', 'assassination',
    'massacre',
    'message', 'messages', 'messaging',
    'passage', 'passages',
    'assemble', 'assembled', 'assembly',
    'assert', 'assertion', 'assertive',
    'asset', 'assets',
    'assume', 'assumed', 'assuming',
    'assure', 'assured', 'assurance',
    'cassava',
    'sassafras',
    'scunthorpe', // Famous false positive example
    'penistone', // UK place name
    'lightwater', // Contains "twat"
  ],

  // Severity levels for graduated filtering
  severity: {
    mild: [
      'damn', 'damnit', 'hell', 'crap', 'piss', 'suck', 'stupid', 'idiot',
      'moron', 'dumb', 'jerk', 'screw', 'butt', 'fart', 'boob', 'heck'
    ],
    moderate: [
      'ass', 'arse', 'asshole', 'bastard', 'bitch', 'bollocks', 'bugger',
      'cock', 'dick', 'douche', 'prick', 'shit', 'slut', 'tit', 'twat', 'whore'
    ],
    strong: [
      'fuck', 'fucked', 'fucker', 'fucking', 'motherfucker', 'cunt',
      'bullshit', 'clusterfuck', 'fuckwit'
    ],
    nsfw: [
      'porn', 'porno', 'xxx', 'nsfw', 'nude', 'naked', 'sex', 'sexy',
      'erotic', 'explicit', 'adult', 'hentai', 'milf', 'anal', 'blowjob',
      'orgasm', 'fetish', 'bdsm', 'masturbate', 'dildo', 'horny'
    ],
    slurs: [
      'nigger', 'nigga', 'chink', 'gook', 'spic', 'kike', 'retard', 'tranny',
      'dyke', 'fag', 'faggot'
    ]
  }
};

// Utility function to check if text contains profanity
function containsProfanity(text, level = 'moderate', customWords = []) {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Check exceptions first - if it's an exception, remove it for checking
  const processedText = PROFANITY_DATA.exceptions.reduce((acc, exception) => {
    return acc.replace(new RegExp(exception, 'gi'), '');
  }, lowerText);

  // Build word list based on severity level
  const wordsToCheck = [];

  switch (level) {
    case 'mild':
      wordsToCheck.push(...PROFANITY_DATA.severity.mild);
      break;
    case 'moderate':
      wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate);
      break;
    case 'strong':
      wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate, ...PROFANITY_DATA.severity.strong);
      break;
    case 'all':
      wordsToCheck.push(...PROFANITY_DATA.en);
      break;
    default:
      wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate);
  }

  // Add custom words to the check list
  if (customWords && customWords.length > 0) {
    wordsToCheck.push(...customWords);
  }

  // Check word boundaries to avoid false positives
  for (const word of wordsToCheck) {
    // Use word boundaries for exact matches
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
    if (regex.test(processedText)) {
      return true;
    }
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
function findProfanity(text, level = 'moderate', customWords = []) {
  if (!text) return [];

  const matches = new Set();
  const lowerText = text.toLowerCase();

  // Build word list based on level
  const wordsToCheck = [];

  switch (level) {
    case 'mild':
      wordsToCheck.push(...PROFANITY_DATA.severity.mild);
      break;
    case 'moderate':
      wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate);
      break;
    case 'strong':
      wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate, ...PROFANITY_DATA.severity.strong);
      break;
    case 'all':
      wordsToCheck.push(...PROFANITY_DATA.en);
      break;
    default:
      wordsToCheck.push(...PROFANITY_DATA.severity.mild, ...PROFANITY_DATA.severity.moderate);
  }

  // Add custom words to the check list
  if (customWords && customWords.length > 0) {
    wordsToCheck.push(...customWords);
  }

  // Check each word with word boundaries
  for (const word of wordsToCheck) {
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
    const wordMatches = text.match(regex);
    if (wordMatches) {
      wordMatches.forEach(match => matches.add(match));
    }
  }

  // Check patterns
  for (const pattern of PROFANITY_DATA.patterns) {
    const patternMatches = text.match(pattern);
    if (patternMatches) {
      patternMatches.forEach(match => matches.add(match));
    }
  }

  return Array.from(matches);
}

// Helper function to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Function to censor profanity in text
function censorProfanity(text, level = 'moderate', replacement = '*', customWords = []) {
  if (!text) return text;

  let censored = text;
  const matches = findProfanity(text, level, customWords);

  // Sort by length (longest first) to handle overlapping matches
  matches.sort((a, b) => b.length - a.length);

  for (const match of matches) {
    const censor = replacement.repeat(match.length);
    // Escape special regex characters in the match
    const escapedMatch = escapeRegExp(match);
    censored = censored.replace(new RegExp(escapedMatch, 'gi'), censor);
  }

  return censored;
}

// Export for use in content script
window.PROFANITY_DATA = PROFANITY_DATA;
window.containsProfanity = containsProfanity;
window.findProfanity = findProfanity;
window.censorProfanity = censorProfanity;
