// Profanity Database
// Word list sourced from the open-source 'cuss' project (MIT License)
// https://github.com/words/cuss — words rated >= 1 (ambiguous or definitely profane)
// Supplemented with regex patterns for leetspeak, censored variants, and spaced-out letters

const PROFANITY_DATA = {
  words: [
"abbo", "abeed", "abid", "abo", "abortion",
"abuse", "addict", "addicts", "africoon", "alla",
"alligator bait", "alligatorbait", "anal", "analannie", "analsex",
"anus", "arabush", "arabushs", "areola", "argie",
"armo", "armos", "arse", "arse bandit", "arsehole",
"ass", "assbagger", "assblaster", "assclown", "asscowboy",
"asses", "assfuck", "assfucker", "asshat", "asshole",
"assholes", "asshore", "assjockey", "asskiss", "asskisser",
"assklown", "asslick", "asslicker", "asslover", "assman",
"assmonkey", "assmunch", "assmuncher", "asspacker", "asspirate",
"asspuppies", "assranger", "asswhore", "asswipe", "athletesfoot",
"babe", "backdoorman", "badfuck", "balllicker", "balls",
"ballsack", "banging", "barelylegal", "barf", "barface",
"barfface", "bastard", "batty boy", "bazongas", "bazooms",
"beanbag", "beanbags", "beaner", "beaners", "beaney",
"beaneys", "beastality", "beastial", "beastiality", "beatoff",
"beatyourmeat", "bestial", "bestiality", "biatch", "bicurious",
"bigass", "bigbastard", "bigbutt", "bitch", "bitcher",
"bitches", "bitchez", "bitchin", "bitching", "bitchslap",
"bitchy", "biteme", "blackman", "blacks", "blowjob",
"bluegum", "bluegums", "boang", "boche", "boches",
"bogan", "bohunk", "bollick", "bollock", "bollocks",
"bondage", "boner", "bong", "boob", "boobies",
"boobs", "booby", "boody", "boong", "boonga",
"boongas", "boongs", "boonie", "boonies", "bootlip",
"bootlips", "booty", "bootycall", "bosche", "bosches",
"boschs", "bounty bar", "bounty bars", "bountybar", "brea5t",
"breastjob", "breastlover", "breastman", "brothel", "buddhahead",
"buddhaheads", "buffies", "bufter", "bufty", "bugger",
"buggered", "buggery", "bule", "bules", "bullcrap",
"bulldike", "bulldyke", "bullshit", "bum boy", "bum chum",
"bum robber", "bumblefuck", "bumfuck", "bung", "bunga",
"bungas", "bunghole", "burr head", "burr heads", "burrhead",
"burrheads", "butchbabes", "butchdike", "butchdyke", "buttbang",
"buttface", "buttfuck", "buttfucker", "buttfuckers", "butthead",
"buttman", "buttmunch", "buttmuncher", "buttpirate", "buttplug",
"buttstain", "byatch", "cacker", "camel jockey", "camel jockeys",
"cameljockey", "cameltoe", "carpetmuncher", "carruth", "chav",
"cheese eating surrender monkey", "cheese eating surrender monkies", "cheeseeating surrender monkey", "cheeseeating surrender monkies", "cheesehead",
"cheeseheads", "cherrypopper", "chi chi man", "chickslick", "china swede",
"china swedes", "chinaman", "chinamen", "chinaswede", "chinaswedes",
"ching chong", "ching chongs", "chingchong", "chingchongs", "chink",
"chinks", "chinky", "choad", "chode", "chonkies",
"chonky", "chonkys", "christ killer", "christ killers", "chug",
"chugs", "chunger", "chungers", "chunkies", "chunky",
"chunkys", "clamdigger", "clamdiver", "clansman", "clansmen",
"clanswoman", "clanswomen", "clit", "clitoris", "clogwog",
"cocaine", "cock", "cockblock", "cockblocker", "cockcowboy",
"cockfight", "cockhead", "cockknob", "cocklicker", "cocklover",
"cocknob", "cockqueen", "cockrider", "cocksman", "cocksmith",
"cocksmoker", "cocksucer", "cocksuck", "cocksucked", "cocksucker",
"cocksucking", "cocktease", "cocky", "cohee", "coitus",
"commie", "condom", "coolie", "coolies", "cooly",
"coon", "coon ass", "coon asses", "coonass", "coonasses",
"coondog", "coons", "copulate", "cornhole", "cra5h",
"crack", "cracka", "cracker", "crackpipe", "crackwhore",
"crap", "crapola", "crapper", "crappy", "crotch",
"crotchjockey", "crotchmonkey", "crotchrot", "cum", "cumbubble",
"cumfest", "cumjockey", "cumm", "cummer", "cumming",
"cummings", "cumquat", "cumqueen", "cumshot", "cunilingus",
"cunillingus", "cunn", "cunnilingus", "cunntt", "cunt",
"cunteyed", "cuntfuck", "cuntfucker", "cuntlick", "cuntlicker",
"cuntlicking", "cuntsucker", "curry muncher", "curry munchers", "currymuncher",
"currymunchers", "cushi", "cushis", "cybersex", "cyberslimer",
"dago", "dagos", "dahmer", "dammit", "damn",
"damnation", "damnit", "darkey", "darkeys", "darkie",
"darkies", "darky", "datnigga", "deapthroat", "deepthroat",
"defecate", "dego", "degos", "demon", "devil",
"devilworshipper", "diaper head", "diaper heads", "diaperhead", "diaperheads",
"dick", "dickbrain", "dickforbrains", "dickhead", "dickless",
"dicklick", "dicklicker", "dickman", "dickwad", "dickweed",
"diddle", "dike", "dildo", "dingleberry", "dink",
"dinks", "dipshit", "dipstick", "dix", "dixiedike",
"dixiedyke", "doggiestyle", "doggystyle", "dong", "doodoo",
"dope", "dot head", "dot heads", "dothead", "dotheads",
"dragqueen", "dragqween", "dripdick", "drug", "drunk",
"drunken", "dumb", "dumbass", "dumbbitch", "dumbfuck",
"dune coon", "dune coons", "dyefly", "dyke", "easyslut",
"eatballs", "eatme", "eatpussy", "eight ball", "eight balls",
"ejaculate", "ejaculated", "ejaculating", "ejaculation", "enema",
"erection", "ero", "esqua", "evl", "excrement",
"exkwew", "facefucker", "faeces", "fag", "fagging",
"faggot", "fagot", "fannyfucker", "fart", "farted",
"farting", "farty", "fastfuck", "fatah", "fatass",
"fatfuck", "fatfucker", "fatso", "fckcum", "feces",
"felatio", "felch", "felcher", "felching", "fellatio",
"feltch", "feltcher", "feltching", "fetish", "fingerfood",
"fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking",
"fister", "fistfuck", "fistfucked", "fistfucker", "fistfucking",
"fisting", "flamer", "flange", "flasher", "flatulence",
"floo", "flydie", "flydye", "fok", "fondle",
"footaction", "footfuck", "footfucker", "footlicker", "footstar",
"foreskin", "forni", "fornicate", "foursome", "fourtwenty",
"freakfuck", "freakyfucker", "freefuck", "fruitcake", "fu",
"fubar", "fuc", "fucck", "fuck", "fucka",
"fuckable", "fuckbag", "fuckbook", "fuckbuddy", "fucked",
"fuckedup", "fucker", "fuckers", "fuckface", "fuckfest",
"fuckfreak", "fuckfriend", "fuckhead", "fuckher", "fuckin",
"fuckina", "fucking", "fuckingbitch", "fuckinnuts", "fuckinright",
"fuckit", "fuckknob", "fuckme", "fuckmehard", "fuckmonkey",
"fuckoff", "fuckpig", "fucks", "fucktard", "fuckwhore",
"fuckyou", "fudge packer", "fudgepacker", "fugly", "fuk",
"fuks", "funfuck", "fuuck", "gable", "gables",
"gangbang", "gangbanged", "gangbanger", "gangsta", "gator bait",
"gatorbait", "gaymuthafuckinwhore", "gaysex", "geez", "geezer",
"geni", "genital", "getiton", "ginzo", "ginzos",
"gipp", "gippo", "gippos", "gipps", "givehead",
"glazeddonut", "gob", "god", "godammit", "goddamit",
"goddammit", "goddamn", "goddamned", "goddamnes", "goddamnit",
"goddamnmuthafucker", "goldenshower", "golliwog", "golliwogs", "gonorrehea",
"gonzagas", "gook", "gook eye", "gook eyes", "gookeye",
"gookeyes", "gookies", "gooks", "gooky", "gora",
"goras", "gotohell", "goy", "goyim", "greaseball",
"greaseballs", "greaser", "greasers", "gringo", "gringos",
"groe", "groid", "groids", "gross", "grostulation",
"gub", "gubba", "gubbas", "gubs", "guinea",
"guineas", "guizi", "gummer", "gwailo", "gwailos",
"gweilo", "gweilos", "gyopo", "gyopos", "gyp",
"gyped", "gypo", "gypos", "gypp", "gypped",
"gyppie", "gyppies", "gyppo", "gyppos", "gyppy",
"gyppys", "gypsies", "gypsy", "gypsys", "hadji",
"hadjis", "hairyback", "hairybacks", "haji", "hajis",
"hajji", "hajjis", "half breed", "half caste", "halfbreed",
"halfcaste", "hamas", "handjob", "haole", "haoles",
"hapa", "hardon", "headfuck", "hebe", "hebephila",
"hebephile", "hebephiles", "hebephilia", "hebephilic", "hebes",
"heeb", "heebs", "heroin", "herpes", "hillbillies",
"hillbilly", "hindoo", "hiscock", "hitler", "hitlerism",
"hitlerist", "hiv", "ho", "hobo", "hodgie",
"hoes", "holestuffer", "homicide", "homo", "homobangers",
"homosexual", "honger", "honkers", "honkey", "honkeys",
"honkie", "honkies", "honky", "hooker", "hookers",
"hooters", "hore", "hori", "horis", "hork",
"horney", "horniest", "horny", "horseshit", "hosejob",
"hoser", "hotdamn", "hotpussy", "hottotrot", "hussy",
"hymen", "hymie", "hymies", "iblowu", "idiot",
"ike", "ikes", "ikey", "ikeymo", "ikeymos",
"ikwe", "illegals", "incest", "indon", "indons",
"injun", "injuns", "insest", "intercourse", "interracial",
"intheass", "inthebuff", "italiano", "jackass", "jackoff",
"jackshit", "jacktheripper", "jap", "japcrap", "japie",
"japies", "japs", "jebus", "jeez", "jerkoff",
"jerries", "jesus", "jesuschrist", "jewboy", "jewed",
"jewess", "jig", "jiga", "jigaboo", "jigaboos",
"jigarooni", "jigaroonis", "jigg", "jigga", "jiggabo",
"jiggabos", "jiggas", "jigger", "jiggers", "jiggs",
"jiggy", "jigs", "jihad", "jijjiboo", "jijjiboos",
"jimfish", "jism", "jiz", "jizim", "jizjuice",
"jizm", "jizz", "jizzim", "jizzum", "juggalo",
"jungle bunnies", "jungle bunny", "junglebunny", "kacap", "kacapas",
"kacaps", "kaffer", "kaffir", "kaffre", "kafir",
"kanake", "katsap", "katsaps", "khokhol", "khokhols",
"kigger", "kike", "kikes", "kimchis", "kink",
"kinky", "kissass", "kkk", "klansman", "klansmen",
"klanswoman", "klanswomen", "knockers", "kock", "kondum",
"koon", "kotex", "krap", "krappy", "kraut",
"krauts", "kuffar", "kum", "kumbubble", "kumbullbe",
"kummer", "kumming", "kumquat", "kums", "kunilingus",
"kunnilingus", "kunt", "kushi", "kushis", "kwa",
"kwai lo", "kwai los", "ky", "kyke", "kykes",
"kyopo", "kyopos", "lactate", "lapdance", "lebo",
"lebos", "lesbain", "lesbayn", "lesbin", "lesbo",
"lez", "lezbe", "lezbefriends", "lezbo", "lezz",
"lezzo", "libido", "licker", "lickme", "limey",
"limpdick", "limy", "liquor", "livesex", "loadedgun",
"lolita", "looser", "loser", "lovebone", "lovegoo",
"lovegun", "lovejuice", "lovemuscle", "lovepistol", "loverocket",
"lowlife", "lsd", "lubejob", "lubra", "luckycammeltoe",
"lugan", "lugans", "lynch", "mabuno", "mabunos",
"macaca", "macacas", "mafia", "magicwand", "mahbuno",
"mahbunos", "mams", "manhater", "manpaste", "marijuana",
"mastabate", "mastabater", "masterbate", "masterblaster", "mastrabator",
"masturbate", "masturbating", "mattressprincess", "mau mau", "mau maus",
"maumau", "maumaus", "meatbeatter", "meatrack", "meth",
"mgger", "mggor", "mick", "mickeyfinn", "milf",
"mockey", "mockie", "mocky", "mofo", "moky",
"molest", "molestation", "molester", "molestor", "moneyshot",
"moon cricket", "moon crickets", "mooncricket", "mooncrickets", "moron",
"moskal", "moskals", "moslem", "mosshead", "mothafuck",
"mothafucka", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckin",
"mothafucking", "mothafuckings", "motherfuck", "motherfucked", "motherfucker",
"motherfuckin", "motherfucking", "motherfuckings", "motherlovebone", "muff",
"muffdive", "muffdiver", "muffindiver", "mufflikcer", "mulatto",
"muncher", "munt", "murder", "murderer", "mzungu",
"mzungus", "narcotic", "nastybitch", "nastyho", "nastyslut",
"nastywhore", "nazi", "necro", "negres", "negress",
"negro", "negroes", "negroid", "negros", "nig",
"nigar", "nigars", "nigerian", "nigerians", "nigers",
"nigette", "nigettes", "nigg", "nigga", "niggah",
"niggahs", "niggar", "niggaracci", "niggard", "niggarded",
"niggarding", "niggardliness", "niggardlinesss", "niggards", "niggars",
"niggas", "niggaz", "nigger", "niggerhead", "niggerhole",
"niggers", "niggle", "niggled", "niggles", "niggling",
"nigglings", "niggor", "niggress", "niggresses", "nigguh",
"nigguhs", "niggur", "niggurs", "niglet", "nignog",
"nigor", "nigors", "nigr", "nigra", "nigras",
"nigre", "nigres", "nigress", "nigs", "nip",
"nipple", "nipplering", "nittit", "nlgger", "nlggor",
"nofuckingway", "nook", "nookey", "nookie", "noonan",
"nooner", "nude", "nudger", "nuke", "nutfucker",
"nymph", "ontherag", "oral", "orga", "orgasim",
"orgasm", "orgies", "orgy", "paddy", "paederastic",
"paederasts", "paederasty", "paki", "pakis", "palesimian",
"pancake face", "pancake faces", "pansies", "pansy", "panti",
"payo", "pearlnecklace", "peck", "pecker", "peckerwood",
"pederastic", "pederasts", "pederasty", "pedo", "pedophile",
"pedophiles", "pedophilia", "pedophilic", "pee", "peehole",
"peepee", "peepshow", "peepshpw", "pendy", "penetration",
"peni5", "penile", "penis", "penises", "perv",
"phonesex", "phuk", "phuked", "phuking", "phukked",
"phukking", "phungky", "phuq", "pi55", "picaninny",
"piccaninny", "pickaninnies", "pickaninny", "piefke", "piefkes",
"piker", "pikey", "piky", "pillow biter", "pimp",
"pimped", "pimper", "pimpjuic", "pimpjuice", "pimpsimp",
"pindick", "piss", "pissed", "pisser", "pisses",
"pisshead", "pissin", "pissing", "pissoff", "pistol",
"pixie", "pixy", "playboy", "playgirl", "pocha",
"pochas", "pocho", "pochos", "pocketpool", "pohm",
"pohms", "polack", "polacks", "pollock", "pollocks",
"pom", "pommie", "pommie grant", "pommie grants", "pommies",
"pommy", "poms", "poo", "poof", "poofta",
"poofter", "poon", "poontang", "poop", "pooper",
"pooperscooper", "pooping", "poorwhitetrash", "popimp", "porch monkey",
"porch monkies", "porchmonkey", "porn", "pornflick", "pornking",
"porno", "pornography", "pornprincess", "prairie nigger", "prairie niggers",
"pric", "prick", "prickhead", "prostitute", "protestant",
"pu55i", "pu55y", "pube", "pubic", "pubiclice",
"pud", "pudboy", "pudd", "puddboy", "puke",
"puntang", "purinapricness", "puss", "pussie", "pussies",
"pussy", "pussycat", "pussyeater", "pussyfucker", "pussylicker",
"pussylips", "pussylover", "pussypounder", "pusy", "quashie",
"queef", "queer", "quickie", "quim", "ra8s",
"racist", "radical", "radicals", "raghead", "ragheads",
"randy", "rape", "raped", "raper", "rapist",
"rearend", "rearentry", "rectum", "redleg", "redlegs",
"redneck", "rednecks", "redskin", "redskins", "reefer",
"reestie", "rentafuck", "rere", "retard", "retarded",
"ribbed", "rigger", "rimjob", "rimming", "round eyes",
"roundeye", "russki", "russkie", "sadis", "sadom",
"sambo", "sambos", "samckdaddy", "sand nigger", "sand niggers",
"sandm", "sandnigger", "satan", "scag", "scallywag",
"scat", "schlong", "schvartse", "schvartsen", "schwartze",
"schwartzen", "screw", "screwyou", "scrotum", "scum",
"semen", "seppo", "seppos", "septic", "septics",
"sex", "sexed", "sexfarm", "sexhound", "sexhouse",
"sexing", "sexkitten", "sexpot", "sexslave", "sextogo",
"sextoy", "sextoys", "sexual", "sexually", "sexwhore",
"sexy", "sexymoma", "sexyslim", "shag", "shaggin",
"shagging", "shat", "shav", "shawtypimp", "sheeney",
"shhit", "shiksa", "shinola", "shit", "shitcan",
"shitdick", "shite", "shiteater", "shited", "shitface",
"shitfaced", "shitfit", "shitforbrains", "shitfuck", "shitfucker",
"shitfull", "shithapens", "shithappens", "shithead", "shithouse",
"shiting", "shitlist", "shitola", "shitoutofluck", "shits",
"shitstain", "shitted", "shitter", "shitting", "shitty",
"shortfuck", "shylock", "shylocks", "sissy", "sixsixsix",
"sixtynine", "sixtyniner", "skank", "skankbitch", "skankfuck",
"skankwhore", "skanky", "skankybitch", "skankywhore", "skinflute",
"skum", "skumbag", "skwa", "skwe", "slanteye",
"slanty", "slapper", "slaughter", "slave", "slavedriver",
"sleezebag", "sleezeball", "slideitin", "slimeball", "slimebucket",
"slopehead", "slopeheads", "sloper", "slopers", "slopey",
"slopeys", "slopies", "slopy", "slut", "sluts",
"slutt", "slutting", "slutty", "slutwear", "slutwhore",
"smack", "smackthemonkey", "smut", "snatch", "snatchpatch",
"sniggers", "snowback", "snownigger", "sodom", "sodomise",
"sodomite", "sodomize", "sodomy", "sonofabitch", "sonofbitch",
"sooties", "sooty", "spade", "spades", "spaghettibender",
"spaghettinigger", "spank", "spankthemonkey", "spearchucker", "spearchuckers",
"sperm", "spermacide", "spermbag", "spermhearder", "spermherder",
"spic", "spick", "spicks", "spics", "spig",
"spigotty", "spik", "spit", "spitter", "splittail",
"spooge", "spreadeagle", "spunk", "spunky", "sqeh",
"squa", "squarehead", "squareheads", "squaw", "squinty",
"stagg", "stiffy", "strapon", "stringer", "stripclub",
"stroking", "stuinties", "stupid", "stupidfuck", "stupidfucker",
"suck", "suckdick", "sucker", "suckme", "suckmyass",
"suckmydick", "suckmytit", "suckoff", "suicide", "swallow",
"swallower", "swalow", "swamp guinea", "swamp guineas", "swastika",
"syphilis", "tacohead", "tacoheads", "taff", "tang",
"tantra", "tar babies", "tar baby", "tarbaby", "tard",
"teat", "terrorist", "teste", "testicle", "testicles",
"thicklip", "thicklips", "thirdeye", "thirdleg", "threesome",
"threeway", "timber nigger", "timber niggers", "timbernigger", "tinker",
"tinkers", "tinkle", "tit", "titbitnipply", "titfuck",
"titfucker", "titfuckin", "titjob", "titlicker", "titlover",
"tits", "tittie", "titties", "titty", "tnt",
"tongethruster", "tonguethrust", "tonguetramp", "tortur", "torture",
"tosser", "towel head", "towel heads", "towelhead", "trailertrash",
"tramp", "trannie", "tranny", "transvestite", "trap",
"triplex", "trisexual", "trots", "tuckahoe", "tunneloflove",
"turd", "turnon", "twat", "twink", "twinkie",
"twobitwhore", "uck", "ukrop", "uncle tom", "unfuckable",
"upskirt", "uptheass", "upthebutt", "usama", "uterus",
"vagina", "vaginal", "vibr", "vibrater", "vibrator",
"virginbreaker", "vomit", "vulva", "wab", "wank",
"wanker", "wanking", "waysted", "weenie", "weewee",
"welcher", "welfare", "wetb", "wetback", "wetbacks",
"wetspot", "whacker", "whash", "whigger", "whiggers",
"whiskeydick", "whiskydick", "whit", "white trash", "whitenigger",
"whites", "whitetrash", "whitey", "whiteys", "whities",
"whiz", "whop", "whore", "whorefucker", "whorehouse",
"wigga", "wiggas", "wigger", "wiggers", "willie",
"williewanker", "willy", "wn", "wog", "wogs",
"wop", "wtf", "wuss", "wuzzie", "xkwe",
"xtc", "xxx", "yank", "yankee", "yankees",
"yanks", "yarpie", "yarpies", "yellowman", "yid",
"yids", "zigabo", "zigabos", "zipperhead", "zipperheads"
  ],

  // Regex patterns for evasion techniques not covered by the word list
  patterns: [
    // Leetspeak substitutions (word-boundary safe)
    /\bf[u@#0]c?k(ing|ed|er|s|face|head|wit|wad|stick)?\b/gi,
    /\bsh[i!1]t(ty|head|face|storm)?\b/gi,
    /\b[a@4]ss(hole|hat|wipe|clown|face)?\b/gi,
    /\bb[i!1]tc?h(es|ing|y)?\b/gi,
    /\bd[i!1]c?k(head|wad|face)?\b/gi,
    /\b[ck][o0][ck]k(sucker|s)?\b/gi,
    /\bp[u0]ss[yi](es)?\b/gi,
    /\btw[a@4]t(s)?\b/gi,
    /\bwh[o0]r[e3](s)?\b/gi,
    /\bsl[u0]t(s|ty)?\b/gi,
    /\bp[o0]rn(o|ography|ographic)?\b/gi,

    // Censored versions (f**k, s**t, etc.)
    /\bf[\*_#]{1,3}k\b/gi,
    /\bs[\*_#]{1,2}t\b/gi,
    /\bc[\*_#]{1,2}t\b/gi,
    /\bb[\*_]tch\b/gi,
    /\bd[\*_]ck\b/gi,
    /\bp[\*_]rn\b/gi,
    /\ba[\*_]{2}hole\b/gi,

    // Spaced-out letters (f u c k, s h i t, etc.)
    /\bf\s+u\s+c\s+k\b/gi,
    /\bs\s+h\s+i\s+t\b/gi,
    /\bb\s+i\s+t\s+c\s+h\b/gi,
    /\bd\s+i\s+c\s+k\b/gi,
  ],

  // Words that appear in the word list above but are legitimate in most contexts.
  // These are excluded when building the filter regex.
  exceptions: new Set([
    // "ass" substring words
    'assumption', 'assumptions',
    'assessment', 'assessments', 'assess', 'assessing',
    'assign', 'assignment', 'assigned', 'assigns',
    'assistance', 'assistant', 'assist', 'assisting',
    'associate', 'associated', 'association',
    'assemble', 'assembled', 'assembly',
    'assert', 'assertion', 'assertive',
    'asset', 'assets',
    'assume', 'assumed', 'assuming',
    'assure', 'assured', 'assurance',
    'class', 'classes', 'classic', 'classical', 'classify',
    'mass', 'masses', 'massive',
    'pass', 'passed', 'passing', 'passenger', 'passport',
    'grass', 'grassland',
    'bass', 'bassist',
    'brass', 'glass', 'glasses',
    'harass', 'harassment', 'harassing',
    'embarrass', 'embarrassed', 'embarrassing',
    'compass', 'trespass', 'trespassing',
    'surpass', 'surpassing', 'bypass',
    'assassin', 'assassination',
    'massacre',
    'message', 'messages', 'messaging',
    'passage', 'passages',
    'cassette', 'cassettes',
    // "dick" substring words
    'dickens', 'dickinson',
    // Place names that famously trigger filters (Scunthorpe problem)
    'scunthorpe', 'penistone',
    'sussex', 'essex', 'middlesex', 'wessex',
    // Proper names in the cuss word list
    'cummings',          // e.e. cummings, Alan Cumming
    // Legitimate English words rated ambiguous by cuss
    'niggard', 'niggards', 'niggardly', 'niggarded', 'niggarding',
    'niggardliness',
    // Common words that appear in the cuss list at rating 1
    'babe',              // colloquial, not typically censored
    'pixie', 'pixy',     // fairy creatures
    'gob',               // British for mouth
    'gross',             // messy/disgusting (common English)
    'geez', 'jeez',      // mild exclamations
    'nymph',             // mythology
    'tantra',            // spiritual practice
    'snatch',            // to grab quickly
    'tramp',             // a hike; homeless person
    'hooters',           // restaurant chain (though vulgar slang too)
    'tinkle',            // gentle sound; child's word for urinate
  ])
};

// ── Supplemental word list from LDNOOBW (List of Dirty, Naughty, Obscene, and
//    Otherwise Bad Words) — CC-BY-4.0, github.com/LDNOOBW
// ─────────────────────────────────────────────────────────────────────────────
const _ldnoobwWords = [
  "2g1c", "2 girls 1 cup", "acrotomophilia", "anilingus",
  "ball gag", "ball gravy", "ball sack", "barely legal", "barenaked", "bareback",
  "bdsm", "bbw", "beastiality", "bestiality",
  "big tits", "bimbos", "blow job", "blow your load", "blue waffle",
  "bung hole", "busty", "buttcheeks", "butthole",
  "camel toe", "camgirl", "camslut", "camwhore", "carpet muncher",
  "circlejerk", "cleveland steamer", "coprolagnia", "coprophilia", "creampie",
  "deep throat", "dendrophilia", "dirty sanchez", "doggie style", "doggiestyle",
  "doggy style", "doggystyle", "domination",
  "donkey punch", "double penetration", "dry hump", "dvda",
  "ecchi", "erotism",
  "female squirting", "femdom", "fingerbang", "fingering",
  "foot fetish", "footjob", "frotting", "fuck buttons",
  "futanari", "gang bang", "gay sex", "genitals",
  "goatse", "golden shower", "gokkun",
  "hand job", "handjob", "hardcore", "hard core",
  "jack off", "jailbait", "jail bait", "jerk off",
  "jiggerboo", "juggs",
  "kinbaku", "kinkster", "lemon party",
  "male squirting", "muff diver", "muffdiving",
  "neonazi", "nig nog", "nipples", "nsfw", "nudity", "nympho", "nymphomania",
  "paedophile", "panties", "panty", "pegging", "phone sex", "piece of shit",
  "pissing", "queef", "rusty trombone",
  "sadism", "scissoring", "sexcam", "shemale", "shibari", "shota",
  "skeet", "splooge", "spooge", "strap on", "strip club",
  "threesome", "throating", "titties", "topless", "tribadism", "twink",
  "upskirt", "voyeur", "voyeurweb",
  "wetback", "yaoi", "zoophilia"
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Pre-compile regex at module load — avoids creating thousands of RegExp
//    objects on every text node check (major performance fix) ─────────────────

// Merge all word sources first, then build the filtered deduplicated list
// (longest first so multi-word phrases are matched before component words)
const _filteredWords = [...new Set([...PROFANITY_DATA.words, ..._ldnoobwWords])]
  .filter(w => w && !PROFANITY_DATA.exceptions.has(w.toLowerCase()))
  .sort((a, b) => b.length - a.length);

// Single combined regex: one pass replaces all matches
const _wordRegex = new RegExp(
  `\\b(${_filteredWords.map(escapeRegExp).join('|')})\\b`,
  'gi'
);

// ─────────────────────────────────────────────────────────────────────────────

// Returns true if text contains any profanity
function containsProfanity(text, customWords) {
  if (!text) return false;

  _wordRegex.lastIndex = 0;
  if (_wordRegex.test(text)) return true;

  // Check custom words (not in pre-compiled regex)
  if (customWords && customWords.length) {
    for (const word of customWords) {
      if (!word) continue;
      if (new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(text)) return true;
    }
  }

  for (const pattern of PROFANITY_DATA.patterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) return true;
  }

  return false;
}

// Removes all profanity from text, returns cleaned string.
// Returns the original string reference unchanged if nothing was removed.
function removeProfanity(text, customWords) {
  if (!text) return text;

  // replace() resets lastIndex internally for non-sticky global regexes,
  // but we reset explicitly here for clarity
  _wordRegex.lastIndex = 0;
  let result = text.replace(_wordRegex, '');

  if (customWords && customWords.length) {
    for (const word of customWords) {
      if (!word) continue;
      result = result.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'), '');
    }
  }

  for (const pattern of PROFANITY_DATA.patterns) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '');
  }

  // Return original if nothing changed — avoids triggering unnecessary DOM
  // writes and preserves whitespace-only text nodes exactly as-is
  if (result === text) return text;

  // Collapse runs of spaces/tabs left by removed words (preserve newlines)
  return result.replace(/[ \t]{2,}/g, ' ');
}

// Export to window for use by content.js and platform scripts
window.PROFANITY_DATA = PROFANITY_DATA;
window.containsProfanity = containsProfanity;
window.removeProfanity = removeProfanity;
