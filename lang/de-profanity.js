// German Profanity Database
// For content filtering purposes

const DE_PROFANITY_DATA = {
  language: 'de',
  languageName: 'German',

  // German profanity organized by severity
  words: {
    mild: [
      'mist', 'verdammt', 'verflucht', 'scheisse', 'kacke',
      'blod', 'blode', 'doof', 'dumm', 'dummkopf',
      'idiot', 'idiotin', 'trottel', 'depp', 'vollidiot',
      'spinner', 'spinnerin', 'spacko', 'spast',
      'penner', 'pennerin', 'loser', 'versager'
    ],
    moderate: [
      'arschloch', 'arsch', 'arsche', 'arschgesicht',
      'wichser', 'wichserin', 'wichsen',
      'fotze', 'fotzen', 'moese', 'mose',
      'schwanz', 'schwanze', 'pimmel',
      'titten', 'brueste', 'moepse',
      'hurensohn', 'hurensohne', 'hure', 'huren', 'nutte',
      'schlampe', 'schlampen', 'miststuck', 'drecksau',
      'fick', 'ficken', 'ficker', 'gefickt', 'verfickt',
      'scheisser', 'scheisskerl', 'dreckskerl',
      'bastard', 'bastarde', 'mistkerl',
      'sau', 'schwein', 'dreckschwein', 'sauhund',
      'pisser', 'pissnelke', 'pissen'
    ],
    strong: [
      'fick dich', 'verpiss dich', 'leck mich',
      'halt die fresse', 'halt dein maul', 'halts maul',
      'du hurensohn', 'deine mutter', 'deine mudda',
      'wichser', 'dreckswichser', 'hurenwichser'
    ],
    nsfw: [
      'porno', 'pornografie', 'pornografisch', 'xxx',
      'sex', 'sexuell', 'sexy', 'erotik', 'erotisch',
      'nackt', 'nackte', 'nacktheit', 'nudist',
      'ficken', 'gefickt', 'vogeln', 'bumsen', 'poppen',
      'schwanz', 'penis', 'glied', 'pimmel', 'latte',
      'fotze', 'muschi', 'mose', 'vagina', 'scheide',
      'titten', 'brueste', 'moepse', 'hupen',
      'arsch', 'hintern', 'po', 'popo',
      'wichsen', 'masturbieren', 'onanieren', 'selbstbefriedigung',
      'blasen', 'lutschen', 'lecken', 'oralsex',
      'orgasmus', 'kommen', 'abspritzen', 'spritzen',
      'geil', 'rattig', 'scharf', 'notgeil', 'spitz'
    ],
    slurs: [
      'neger', 'negerin', 'bimbo', 'kanake', 'kanaken',
      'schwuchtel', 'schwuler', 'schwule', 'tunte', 'homo',
      'lesbe', 'kampflesbe',
      'behinderter', 'behinderte', 'mongo', 'spasti'
    ]
  },

  // Pattern variations
  patterns: [
    /sch[e3][i1!]ss[e3]?/gi,
    /f[i1!]ck[e3]?n?/gi,
    /[a4]rschl[o0]ch/gi,
    /w[i1!]chs[e3]r/gi,
    /f[o0]tz[e3]/gi,
    /hur[e3]ns[o0]hn/gi,
    /schw[a4]nz/gi,
    /t[i1!]tt[e3]n/gi
  ],

  // Exceptions
  exceptions: [
    'arschitektur', // architecture-related
    'schwanz', // tail (animal)
    'geil', // great/awesome in casual speech
    'ficken', // in some dialects, means "to rub"
    'lecker', // delicious
    'Sex', // in educational/medical context
    'nackt', // artistic context
    'tittel' // title
  ]
};

// Export
if (typeof window !== 'undefined') {
  window.DE_PROFANITY_DATA = DE_PROFANITY_DATA;
}
