// Portuguese Profanity Database
// For content filtering purposes (Brazilian & European Portuguese)

const PT_PROFANITY_DATA = {
  language: 'pt',
  languageName: 'Portuguese',

  // Portuguese profanity organized by severity
  words: {
    mild: [
      'merda', 'droga', 'porcaria', 'raios', 'diabos',
      'idiota', 'imbecil', 'estupido', 'estupida', 'burro', 'burra',
      'otario', 'otaria', 'babaca', 'mane', 'trouxa',
      'besta', 'tonto', 'tonta', 'bobo', 'boba',
      'chato', 'chata', 'irritante', 'mala'
    ],
    moderate: [
      'caralho', 'cacete', 'porra', 'foda', 'fodase',
      'puta', 'puto', 'putaria', 'puteiro',
      'cuzao', 'cu', 'bunda', 'rabo',
      'pau', 'pica', 'piroca', 'rola', 'cabeça de pica',
      'buceta', 'xoxota', 'xereca', 'ppk',
      'viado', 'viadinho', 'bicha', 'bichona',
      'arrombado', 'arrombada', 'corno', 'cornudo',
      'desgraçado', 'desgraçada', 'safado', 'safada',
      'vagabundo', 'vagabunda', 'vadia', 'vadio',
      'filho da puta', 'filha da puta', 'fdp',
      'foder', 'fodido', 'fodida', 'fudido', 'fudida',
      'cagar', 'cagado', 'cagada', 'cagao'
    ],
    strong: [
      'vai se foder', 'vai tomar no cu', 'vsf', 'vtnc',
      'puta que pariu', 'pqp', 'caralho mulher',
      'filho de uma puta', 'sua puta', 'seu merda',
      'chupa meu pau', 'mama aqui', 'vai se fuder'
    ],
    nsfw: [
      'porno', 'pornografia', 'xxx',
      'sexo', 'sexual', 'sexy', 'sensual',
      'nu', 'nua', 'nus', 'nuas', 'nudez', 'pelado', 'pelada',
      'transar', 'trepar', 'foder', 'comer', 'dar',
      'pau', 'pica', 'piroca', 'rola', 'cacete', 'penis',
      'buceta', 'xoxota', 'xereca', 'vagina', 'ppk', 'perseguida',
      'peitos', 'seios', 'tetas', 'mamas', 'peito',
      'bunda', 'cu', 'rabo', 'traseiro',
      'punheta', 'bater punheta', 'masturbar', 'masturbacao',
      'chupar', 'boquete', 'mamada', 'chupeta',
      'gozar', 'gozo', 'orgasmo', 'ejacular',
      'tesao', 'excitado', 'excitada', 'tarado', 'tarada',
      'safado', 'safada', 'putaria', 'sacanagem'
    ],
    slurs: [
      'preto de merda', 'crioulo', 'macaco', 'negrada',
      'viado', 'viadinho', 'bicha', 'bichona', 'boiola', 'fresco',
      'sapatao', 'lesbica de merda', 'caminhoneira',
      'retardado', 'retardada', 'mongoloide', 'demente'
    ]
  },

  // Pattern variations
  patterns: [
    /c[a4]r[a4]lh[o0]/gi,
    /p[o0]rr[a4]/gi,
    /f[o0]d[a4]/gi,
    /put[a4]/gi,
    /m[e3]rd[a4]/gi,
    /c[u0]z[a4][o0]/gi,
    /b[u0]c[e3]t[a4]/gi,
    /p[a4]u/gi,
    /v[i1!][a4]d[o0]/gi
  ],

  // Exceptions
  exceptions: [
    'cultura', 'cultural', 'agricultura',
    'pau', // wood/stick
    'pica', // injection (medical)
    'bicho', 'bicha', // animal/creature
    'comer', // to eat
    'rabo', // tail
    'gozar', // to enjoy (formal)
    'tesao', // determination (archaic)
    'negro', 'negra' // color/black
  ]
};

// Export
if (typeof window !== 'undefined') {
  window.PT_PROFANITY_DATA = PT_PROFANITY_DATA;
}
