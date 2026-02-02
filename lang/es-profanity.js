// Spanish Profanity Database
// For content filtering purposes

const ES_PROFANITY_DATA = {
  language: 'es',
  languageName: 'Spanish',

  // Spanish profanity organized by severity
  words: {
    mild: [
      'mierda', 'carajo', 'diablos', 'demonios', 'rayos',
      'tonto', 'tonta', 'idiota', 'estupido', 'estupida',
      'imbecil', 'tarado', 'tarada', 'bobo', 'boba',
      'pesado', 'pesada', 'molesto', 'molesta', 'fastidioso'
    ],
    moderate: [
      'cabron', 'cabrona', 'cabrones', 'pendejo', 'pendeja',
      'gilipollas', 'capullo', 'culo', 'culos', 'nalgas',
      'puta', 'putas', 'puto', 'putos', 'zorra', 'zorras',
      'verga', 'vergas', 'polla', 'pollas', 'picha',
      'cojones', 'huevos', 'pelotas', 'bolas',
      'mamon', 'mamona', 'mamones', 'mamalon',
      'chingar', 'chingado', 'chingada', 'chingados',
      'joder', 'jodido', 'jodida', 'jodidos',
      'cojon', 'cojudo', 'cojuda', 'boludo', 'boluda'
    ],
    strong: [
      'puta madre', 'hijo de puta', 'hija de puta',
      'concha', 'conchetumadre', 'conchudo', 'conchuda',
      'culero', 'culera', 'culeros',
      'marica', 'maricon', 'maricones', 'maricona',
      'puto amo', 'me cago en', 'hostia puta'
    ],
    nsfw: [
      'porno', 'pornografia', 'xxx',
      'sexo', 'sexual', 'sexy',
      'desnudo', 'desnuda', 'desnudos', 'desnudas',
      'follar', 'follando', 'follado', 'follada',
      'coger', 'cogiendo', 'cogido', 'cogida',
      'tetas', 'pechos', 'senos', 'chichis',
      'culo', 'trasero', 'pompi', 'pompis',
      'pene', 'pito', 'miembro', 'falo',
      'vagina', 'concha', 'chocho', 'cuca', 'papaya',
      'masturbar', 'masturbacion', 'pajear', 'pajearse',
      'orgasmo', 'correrse', 'eyacular', 'venirse',
      'mamada', 'chupar', 'mamar',
      'penetrar', 'penetracion', 'meter',
      'erotico', 'erotica', 'excitado', 'excitada',
      'caliente', 'cachondo', 'cachonda', 'arrecho', 'arrecha'
    ],
    slurs: [
      'negro de mierda', 'sudaca', 'indio', 'cholo',
      'marica', 'maricon', 'joto', 'punal', 'loca',
      'tortillera', 'machorra', 'marimacho',
      'retrasado', 'retrasada', 'mogolico', 'subnormal'
    ]
  },

  // Pattern variations
  patterns: [
    /m[i1!]erda/gi,
    /p[u0]ta/gi,
    /c[a4]br[o0]n/gi,
    /ch[i1!]ng[a4]/gi,
    /j[o0]d[e3]r/gi,
    /c[o0]j[o0]n/gi,
    /h[u0][e3]v[o0]s/gi,
    /v[e3]rg[a4]/gi,
    /p[o0]ll[a4]/gi,
    /c[u0]l[o0]/gi
  ],

  // Exceptions (legitimate words that might match)
  exceptions: [
    'cultura', 'cultural', 'aculturar',
    'calidad', 'calidez', 'caliente', // context-dependent
    'pendiente', 'pendientes',
    'negro', 'negra', // color only
    'coger', // varies by region - means "to take" in Spain
    'concha', // seashell in some contexts
    'huevo', 'huevos' // eggs
  ]
};

// Export
if (typeof window !== 'undefined') {
  window.ES_PROFANITY_DATA = ES_PROFANITY_DATA;
}
