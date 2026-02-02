// French Profanity Database
// For content filtering purposes

const FR_PROFANITY_DATA = {
  language: 'fr',
  languageName: 'French',

  // French profanity organized by severity
  words: {
    mild: [
      'merde', 'zut', 'flute', 'crotte', 'punaise',
      'idiot', 'idiote', 'imbecile', 'cretin', 'cretine',
      'stupide', 'bete', 'nul', 'nulle', 'naze',
      'debile', 'abruti', 'abrutie', 'andouille',
      'con', 'conne', 'connard', 'connasse'
    ],
    moderate: [
      'putain', 'pute', 'salope', 'salaud', 'salopard',
      'bordel', 'bordel de merde', 'merde alors',
      'enculer', 'encule', 'enculee', 'enfoirer', 'enfoire',
      'batard', 'batarde', 'fils de pute', 'fille de pute',
      'couilles', 'couillon', 'couillonne',
      'bite', 'bites', 'queue', 'queues',
      'nichons', 'nibards', 'tetons',
      'cul', 'fesses', 'derche', 'petard',
      'chier', 'chieur', 'chieuse', 'chiotte',
      'foutre', 'fouteur', 'foutaise', 'je men fous',
      'branleur', 'branleuse', 'branler', 'branlette',
      'nique', 'niquer', 'niqueur', 'nique ta mere'
    ],
    strong: [
      'enculer', 'va te faire foutre', 'va te faire enculer',
      'nique ta mere', 'ntm', 'fdp', 'fils de pute',
      'ta gueule', 'ferme ta gueule', 'ta geule',
      'pute borgne', 'grosse pute', 'sale pute'
    ],
    nsfw: [
      'porno', 'pornographie', 'pornographique', 'xxx',
      'sexe', 'sexuel', 'sexuelle', 'sexy',
      'nu', 'nue', 'nus', 'nues', 'nudite',
      'baiser', 'baise', 'baisee', 'baiseur',
      'bite', 'bites', 'penis', 'verge',
      'chatte', 'chattes', 'vagin', 'vulve', 'moule',
      'sein', 'seins', 'nichons', 'tetons', 'poitrine',
      'cul', 'fesses', 'derriere', 'postérieur',
      'jouir', 'jouissance', 'orgasme', 'ejaculer',
      'masturber', 'masturbation', 'branler', 'branlette',
      'sucer', 'sucette', 'fellation', 'pipe',
      'sodomie', 'sodomiser', 'enculer',
      'excite', 'excitee', 'bandant', 'bandante',
      'erotique', 'lubrique', 'salace'
    ],
    slurs: [
      'negre', 'negresse', 'bougnoule', 'arabe de merde',
      'pede', 'pedal', 'tapette', 'tantouze', 'tarlouze',
      'gouine', 'lesbienne de merde',
      'mongol', 'mongole', 'attarde', 'attardee', 'debile mental'
    ]
  },

  // Pattern variations
  patterns: [
    /m[e3]rd[e3]/gi,
    /put[a4][i1!]n/gi,
    /s[a4]l[o0]p[e3]/gi,
    /[e3]ncul[e3]/gi,
    /n[i1!]qu[e3]/gi,
    /b[i1!]t[e3]/gi,
    /ch[a4]tt[e3]/gi,
    /c[o0]nn[a4]rd/gi,
    /f[o0]utr[e3]/gi
  ],

  // Exceptions
  exceptions: [
    'connaître', 'connaissance', 'connu', 'connue',
    'bitume', 'biture',
    'culture', 'culturel', 'culturelle',
    'sexiste', // keep for context
    'queue' // line/tail context
  ]
};

// Export
if (typeof window !== 'undefined') {
  window.FR_PROFANITY_DATA = FR_PROFANITY_DATA;
}
