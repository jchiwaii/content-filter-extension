// Profanity Database — Full combined wordlist (cuss + LDNOOBW + CORE)
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
"yids", "zigabo", "zigabos", "zipperhead", "zipperheads",
"bitchass", "bitchtits", "bitchybutt", "bloodclaat", "bloodclat",
"bollocks", "breast milk", "breastmilk", "breastplates",
"cameltoe", "carwash", "cawk", "chode", "chong",
"clitface", "clitfuck", "clithead", "cockgoblin", "cockholster",
"cockknob", "cockmongler", "cocknose", "cockpocket",
"cumdumpster", "cumguzzler", "cumjockey", "cumskins",
"cunilingus", "cuntface", "cunthole", "cuntlicker",
"cuntrag", "cuntsucker", "dickbag", "dickbeaters",
"dickbreath", "dickburger", "dickdipper", "dickflipper",
"dickhead", "dickhole", "dickjuice", "dickmilk",
"dicknose", "dickream", "dickskin", "dickstain",
"dickweed", "dickwod", "dildobag", "dildo",
"dingleberry", "dink", "dinks", "dipshit",
"doochbag", "dooch", "doodoo", "douche", "douchebag",
"douchecanoe", "douchefuck", "douchey", "ejac",
"ejaculate", "ejaculated", "ejaculates", "ejaculating",
"ejaculation", "enlarge", "erection", "erotic",
"excrement", "expose", "fag", "fagbag", "fageater",
"faggot", "faggotcock", "fagtard", "fatass",
"fatfuck", "fatpiece", "fellatio", "feltch",
"femdom", "fetish", "fisting", "flamer",
"frot", "fuckable", "fuckbucket", "fuckbuddy",
"fuckbutter", "fuckbutton", "fuckdoll", "fuckface",
"fuckhead", "fuckhole", "fuckin", "fuckknob",
"fuckmeat", "fuckoff", "fuckpig", "fucktard", "fuckwitt",
"fucktoy", "fucktrumpet", "fucktunnel", "fuckwit",
"gayass", "gaybashing", "gayboy", "gayfuck",
"gaylord", "gaywad", "goddamn", "goddamnit",
"goldenshower", "gonad", "gonorrhea", "gook",
"gparty", "gspot", "guineapig",
"handjob", "hardcore", "hardon", "hentai",
"homo", "homosexual", "hooker", "horny",
"horseshit", "hump", "incest", "jackass",
"jackoff", "jerk", "jerkass", "jerkoff",
"jizz", "juggs", "junglebunny",
"kike", "kinky", "knob", "knobhead",
"knobjockey", "knobjocky", "knobrot", "knobsucker",
"knobweed", "knobj", "kum", "kummer",
"kums", "kunilingus", "kunt", "kyke",
"labia", "lesbo", "lezbo", "lezzie",
"lolita", "lovefluid", "lovejuice", "lubejob",
"masturbate", "masturbation", "masturbatory",
"menstruate", "menstruation", "milf",
"molester", "molestor", "monsterfuck",
"motherfuck", "motherfucker", "motherfucking",
"muff", "muffdiver", "muffdiving",
"mung", "murder", "murdermachine",
"naked", "nazi", "necrophilia",
"negro", "negress", "negroid", "nig",
"niggard", "nigger", "niggerfucker", "niglet",
"nympho", "nymphomaniac",
"oral", "orgasm", "orgy", "panties",
"panty", "pedo", "pedophile", "pedophilia",
"pecker", "peckerhead", "pegging",
"penetrate", "penetration", "penis", "penisface",
"penishead", "penispump", "perv", "perversion",
"phuck", "phucker", "phuk", "phuked",
"phuking", "phukked", "phukking", "phuq",
"pimp", "pimped", "pimpjuice", "pimpsimp",
"pissed", "pisser", "pissflaps", "pisshole",
"pisspig", "pisspump", "pisswater",
"playboy", "playgirl", "pleasuretool",
"pocketpool", "pollock", "pollocks",
"poon", "poonani", "poontang",
"popimp", "porchmonkey", "porn", "pornfood",
"pornography", "pr0n", "precum",
"prostate", "pu55y", "pube", "pubes",
"pubic", "punani", "puss", "pussies",
"pussy", "pussycat", "pussyeater", "pussyfucker",
"pussylicker", "pussylips", "pussylover", "pussypounder",
"queaf", "queef", "quim", "raghead",
"rape", "raper", "rapist",
"rectum", "redneck", "redskin",
"rimjob", "rimming", "sadism", "sadist",
"sandnigger", "scat", "schlong",
"scrotum", "scum", "semen",
"sex", "sexed", "sexfarm", "sexhound",
"sexhouse", "sexing", "sextoy", "sextoys",
"sextv", "sexual", "sexually",
"shag", "shaggin", "shagging",
"shat", "shemale", "shit", "shitass",
"shitbag", "shitbreath", "shitcan", "shitcunt",
"shitdick", "shite", "shiteater",
"shitface", "shitfaced", "shitfuck", "shitfucker",
"shithead", "shithole", "shithouse", "shitskin",
"shitstain", "shitt", "shitted", "shitter",
"shitting", "shitty", "shitz",
"skank", "skankbitch", "skankfuck", "skankwhore",
"skanky", "skinflute",
"slit", "slut", "slutbag", "slutbucket",
"slutface", "sluthead", "slutmouth", "sluts",
"slutt", "slutting", "slutty", "slutwear",
"slutwhore", "smegma", "smokeafat",
"snatch", "snot", "sodom", "sodomise",
"sodomite", "sodomize", "sodomy",
"spank", "spankthemonkey", "sperm", "spermacide",
"spermbag", "spermhead", "spermherder",
"spooge", "spunk", "spunky",
"stripper", "sumofabitch", "swallow",
"tampon", "tantra", "tard", "teabag",
"teat", "teste", "testicle", "testicles",
"threesome", "throatfuck", "throatfucker",
"throbbing", "titt", "titties", "titty",
"tonguetwist", "topless", "tosser",
"tramp", "trannie", "tranny",
"transvestite", "tribadism",
"trisexual", "trots", "turd",
"twat", "twathead", "twatling",
"twatwaffle", "twink", "twinkie",
"twofaced", "twotiming",
"upskirt", "urethra", "uterus",
"vag", "vagina", "vaginal",
"vibrator", "virgin",
"vomit", "vulva",
"wank", "wanker", "wanking",
"wankjob", "wanky",
"watersports", "wax",
"weed", "weewee",
"wetback", "whore", "whorebag",
"whoreface", "whorefucker", "whorehouse",
"whores", "whoring",
"wigger", "willie", "willy",
"wog", "wop",
"xrated",
"yeast",
"yiff",
"zoofilia", "zoophilia",
"airhead", "bellend", "bimbo", "bonehead", "bozo", "bugger", "cheapskate",
"chickenshit", "cockwomble", "dimwit", "doofus", "duffer", "dunce", "dork",
"gold digger", "mindfuck", "minger", "mooncalf", "nincompoop", "numbnuts",
"numpty", "nutjob", "pillock", "prat", "scumbag", "smartass", "snollygoster",
"tramp", "wazzack",
"assbag", "assbandit", "assbanger", "assbite", "asscock", "asscracker",
"assface", "assgoblin", "ass-hat", "asshead", "asshopper", "ass-jabber",
"assjacker", "assnigger", "ass-pirate", "assshit", "assshole",
"asssucker", "asswad",
"axwound",
// B‑Z words from noswearing.com dictionary (A already included above)
"backdoorman","badfuck","badonkadonk","baggage","bajingo","ballbag","ballbuster","ballfondler","ballgravy","balllicker","balls","ballsack","bamboo","bango","bangbros","barf","barface","bastard","battyboy","bazongas","bazooms","beanbag","beaner","beaney","beastiality","beatoff","beebug","beeyotch","bestiality","biatch","bicurious","bigass","bigbastard","bigbutt","bigtits","bimbos","bitch","bitchass","bitcher","bitches","bitchin","bitching","bitchslap","bitchtits","bitchy","biteme","blackman","blacks","blow job","blowjob","blueball","bluegum","boang","boches","bogan","bohunk","bollicks","bollock","bollocks","bondage","boner","bong","bonk","boob","boobies","boobs","booby","boody","boong","boonie","boons","bootlip","booty","bootycall","bosch","bountybar","breast","breastjob","breastlover","breastman","brothel","buddhahead","buffies","bugger","buggered","buggery","bule","bules","bullcrap","bulldike","bulldyke","bullshit","bumblefuck","bumfuck","bunghole","burrhead","bush","butchbabes","butchdike","butchdyke","buttbang","buttcheeks","buttface","buttfuck","buttfucker","butthead","butthole","buttman","buttmunch","buttmuncher","buttpirate","buttplug","buttstain","byatch",
"cacker","cameljockey","cameltoe","carpetmuncher","catcrap","chav","cheese eating surrender monkey","cheesehead","cherrypopper","chi chi man","chickslick","china swede","chinaman","ching chong","chink","chinky","choad","chode","chonkies","chonky","chug","chunger","clamdigger","clansman","clanswoman","clit","clitoris","clogwog","cocaine","cock","cockblock","cockcowboy","cockfight","cockhead","cockknob","cocklicker","cocklover","cocknob","cockqueen","cockrider","cocksman","cocksmith","cocksmoker","cocksucker","cocktease","coitus","commie","condom","coolie","cooly","coon","coonass","coondog","coons","copulate","cornhole","crack","cracka","cracker","crackpipe","crackwhore","crap","crapola","crapper","crappy","crotch","crotchjockey","crotchmonkey","crotchrot","cum","cumbubble","cumfest","cumjockey","cummer","cumming","cumquat","cumqueen","cumshot","cunnilingus","cunt","cunteyed","cuntfuck","cuntfucker","cuntlicker","cuntlicking","cuntsucker","currymuncher","cushi","cybersex",
"dago","dagos","dahmer","dammit","damn","damnation","damnit","darkey","darkie","darky","datnigga","deepthroat","defecate","dego","demon","devil","diaperhead","dick","dickbrain","dickforbrains","dickhead","dickless","dicklicker","dickman","dickwad","dickweed","diddle","dike","dildo","dingleberry","dink","dipshit","dipstick","dix","dixiedike","dixiedyke","doggiestyle","doggystyle","dong","doodoo","dope","dothead","dragqueen","dripdick","drug","drunk","dumb","dumbass","dumbbitch","dumbfuck","dunecoon","dyefly","dyke",
"easyslut","eatballs","eatme","eatpussy","eightball","ejaculate","ejaculation","enema","erection","excrement",
"deggo","dickbag","dickbeaters","dickfuck","dickfucker","dickmonger","dicks","dickslap","dicksucker","dicksucking","dicktickler","dickweasel","docking","dook","dookie","douche-fag","douchewaffle","dumass","dumbshit","dumshit","facefucker","faeces","fag","fagging","faggot","fagot","fannyfucker","fart","farting","fastfuck","fatah","fatass","fatfuck","fatso","fckcum","feces","felatio","felch","felcher","felching","fellatio","feltch","fetish","fingerfood","fingerfuck","fistfuck","fisting","flamer","flange","flasher","flatulence","foah","fondle","footfuck","footlicker","foreskin","fornicate","foursome","freakfuck","freefuck","fruitcake","fu","fubar","fuck","fucka","fuckable","fuckbag","fuckbook","fuckbuddy","fucked","fucker","fuckers","fuckface","fuckfest","fuckfreak","fuckfriend","fuckhead","fuckher","fuckin","fucking","fuckingbitch","fuckinright","fuckit","fuckknob","fuckme","fuckmonkey","fuckoff","fuckpig","fucks","fucktard","fuckwitt","fuckwhore","fuckyou","fudgepacker","fugly","fuk","funfuck",
"gable","gangbang","gangbanged","gangbanger","gangsta","gatorbait","gaymuthafuckinwhore","gaysex","geezer","genitals","getiton","ginzo","gippo","givehead","glazeddonut","gob","godammit","goddammit","goddamn","goddamned","goldenshower","golliwog","gonad","gonorrhea","gonzagas","gook","gookeye","gooks","goy","goyim","greaseball","greaser","gringo","groid","gross","guinea","gummer","gwailo","gweilo","gyp","gypped",
"hadji","haji","hajji","halfbreed","halfcaste","hamas","handjob","haole","hapa","hardon","headfuck","hebe","hebephile","hebes","heeb","heroin","herpes","hillbilly","hindoo","hiscock","hitler","hitlerism","hiv","ho","hodgie","hoes","holestuffer","homicide","homo","homosexual","honkers","honkey","honkie","honky","hooker","hooters","hore","hori","horny","horseshit","hosejob","hoser","hotpussy","hottotrot","hussy","hymen","hymie",
"iblowu","idiot","ike","ikey","ikwe","illegals","incest","indon","injun","insest","intercourse","interracial","intheass","inthebuff","italiano",
"jackass","jackoff","jackshit","jacktheripper","jap","japcrap","japie","japs","jebus","jeez","jerkoff","jerries","jesus","jesuschrist","jewboy","jewed","jewess","jig","jiga","jigaboo","jigarooni","jigg","jigga","jiggas","jigger","jiggs","jigy","jigs","jihad","jijjiboo","jimfish","jism","jiz","jizim","jizm","jizz","jizzim","jizzum","juicy","juggalo","junglebunny",
"kacap","kaffer","kaffir","kafir","kanake","katsap","khokhol","kigger","kike","kikes","kimchis","kink","kinky","kissass","kkk","klansman","klanswoman","knockers","kock","kondum","koon","kotex","krap","kraut","kuffar","kum","kumbubble","kummer","kumquat","kums","kunilingus","kunnilingus","kunt","kushi","kwa","kwailo","ky","kyke","kykes",
"lactate","lapdance","lebo","lesbain","lesbo","lez","lezbo","lezz","lezzo","libido","licker","lickme","limey","limpdick","liquor","livesex","loadedgun","lolita","loser","lovebone","lovegoo","lovegun","lovejuice","lovemuscle","lovepistol","loverocket","lowlife","lsd","lubejob","lubra","luckycammeltoe","lugan","lynch",
"macaca","mafia","magicwand","mamams","manhater","manpaste","marijuana","mastabate","mastrabator","masturbate","mattressprincess","maumau","meatbeatter","meatrack","meth","mgger","mick","mickeyfinn","milf","mockey","mocky","mofo","moky","molest","molestation","molester","moron","moskal","moslem","mosshead","mothafuck","mothafucka","mothafucker","motherfuck","motherfucker","motherfucking","muff","muffdive","muffdiver","muffindiver","mufflikcer","mulatto","muncher","munt","murder","murderer","mzungu",
"narcotic","nastybitch","nastyho","nastyslut","nastywhore","nazi","necro","negres","negress","negro","negroid","nig","nigar","nigerian","nigette","nigg","nigga","niggah","niggard","niggaracci","niggas","niggaz","nigger","niggerhead","niggerhole","niggers","niggle","niggling","niggor","nigguh","niggur","niglet","nignog","nigr","nigra","nigre","nigs","nip","nipple","nipplering","nlgger","nofuckingway","nookey","nookie","noonan","nooner","nude","nudger","nutfucker","nymph",
"oral","orgasim","orgasm","orgies","orgy",
"paddy","paederasty","paki","palesimian","pancake face","pansy","panti","payo","pearlnecklace","pecker","peckerwood","pederasty","pedo","pedophile","pedophilia","pee","peehole","peepee","peepshow","peepshpw","penetration","penis","penises","perv","phonesex","phuk","phuked","phuking","phukked","phukking","phuq","pi55","picaninny","piccaninny","pickaninnies","pickaninny","piefke","piker","pikey","pimp","pimpjuice","pimpsimp","pindick","piss","pissed","pisser","pisshead","pissing","pissoff","pistol","pixie","pixy","playboy","playgirl","pocha","pocho","pocketpool","pohm","polack","pollock","pom","pommie","pommy","poo","poof","poofta","poon","poontang","poop","pooper","pooperscooper","poorwhitetrash","popimp","porchmonkey","porn","pornflick","pornking","porno","pornography","pornprincess","prairie nigger","pric","prick","prickhead","prostitute","pu55i","pu55y","pube","pubic","pubiclice","pud","pudboy","pudd","puke","puntang","puss","pussie","pussies","pussy","pussycat","pussyeater","pussyfucker","pussylicker","pussylips","pussylover","pussypounder","pusy",
"quashie","queef","queer","quickie","quim",
"ra8s","racist","radical","radicals","raghead","randy","rape","raped","raper","rapist","rearend","rearentry","rectum","redleg","redneck","redskin","reefer","rentafuck","rere","retard","retarded","rimjob","rimming","roundeyes","russki",
"sadis","sadom","sambo","sandnigger","satan","scag","scallywag","scat","schlong","schvartse","screw","scrotum","scum","semen","seppo","septic","sex","sexed","sexfarm","sexhound","sexhouse","sexing","sexkitten","sexpot","sexslave","sextoy","sextoys","sexual","sexually","sexwhore","sexy","shag","shagging","shat","sheeney","shiksa","shinola","shit","shitcan","shitdick","shite","shited","shitface","shitfaced","shitfit","shitforbrains","shitfuck","shitfull","shithappens","shithead","shithole","shithouse","shitlist","shitola","shitoutofluck","shits","shitstain","shitted","shitter","shitting","shitty","shortfuck","shylock","sissy","sixsixsix","sixtynine","skank","skankbitch","skankfuck","skankwhore","skanky","skinflute","skum","skumbag","slanteye","slapper","slaughter","slave","slavedriver","sleezebag","sleezeball","slimeball","slimebucket","slopehead","sloper","slut","sluts","slutting","slutty","slutwear","slutwhore","smack","smackthemonkey","smut","snatch","snatchpatch","snowback","snownigger","sodom","sodomise","sodomite","sodomize","sodomy","sonofabitch","sooties","sooty","spade","spades","spaghettibender","spaghettinigger","spank","spankthemonkey","spearchucker","sperm","spermacide","spermbag","spermherder","spic","spick","spig","spik","spit","splittail","spooge","spreadeagle","spunk","squarehead","squaw","squinty","stiffy","strapon","stripclub","stroking","stupid","stupidfuck","suck","suckdick","sucker","suckme","suckmyass","suckmydick","suckmytit","suckoff","suicide","swallow","swallower","swastika","syphilis",
"tacohead","taff","tang","tantra","tar babies","tarbaby","tard","teat","terrorist","teste","testicle","testicles","thicklip","thirdeye","thirdleg","threesome","threeway","timber nigger","tinker","tinkle","tit","titfuck","titfucker","titjob","titlicker","titlover","tits","tittie","titties","titty","tnt","tonguethrust","tosser","towelhead","trailertrash","tramp","trannie","tranny","transvestite","trap","trisexual","trots","tuckahoe","turd","twat","twink","twinkie","twobitwhore",
"uck","ukrop","uncle tom","unfuckable","upskirt","uptheass","upthebutt","usama","uterus",
"vagina","vaginal","vibr","vibrater","vibrator","virginbreaker","vomit","vulva",
"wab","wank","wanker","wanking","waysted","weenie","weewee","welcher","welfare","wetb","wetback","wetspot","whacker","whash","whigger","whiskeydick","whiskydick","white trash","whitenigger","whites","whitetrash","whitey","whities","whiz","whop","whore","whorefucker","whorehouse","wigga","wigger","wiggers","willie","williewanker","willy","wog","wop","wtf","wuss","wuzzie",
"xkwe","xtc","xxx",
"yank","yankee","yanks","yarpie","yellowman","yid","yids",
"zigabo","zigabos","zipperhead","zipperheads",
// Additional missing words from noswearing.com (A-D)
"asses","asslick","asslicker","assmonkey","assmunch","assmuncher","asspirate","asswipe",
"bampot","beaner","beartrap","bollox","butt plug","butt-pirate","buttfucka",
"chesticle","chinc",
"dick-sneeze",
"clitweasel","clusterfuck","cockass","cockbite","cockburger","cockface","cockfucker","cockjockey","cockknoker","cockmaster","cockmongruel","cockmonkey","cockmuncher","cocknugget","cockshit","cocksmoke","cocksniffer","cockwaffle","coochie","coochy","cooter","cracker","cumslut","cumtart","cunnie","cuntass","cuntbubble","cuntface","cunthole","cuntlicker","cuntrag","cuntslut",
"fagfucker","faggit","fagnut","fuckass","fuckboy","fuckbrain","fuckbutt","fuckersucker","fucknose","fucknut","fucknutt","fucktart","fuckup",
"gaybob","gaydo","gayfuckist","gaytard","gaylord","gaywad",
"gooch","goopchute","guido",
"hard on","hoe","homodumbshit","humping",
"jagoff",
"kooch","kootch",
"lameass","lardass","lesbian",
"mcfagget","minge","munging",
"panooch","penisbanger","penisfucker","penispuffer","polesmoker","poonany","punanny","punta","pussylicking","puto",
"queerbait","queerhole",
"renob","ruski",
"scrote","shitbagger","shitbrains","shitcanned","shitspitter","shittiest","shiz","shiznit","skullfuck","smeg","spook","suckass",
"thundercunt","tittyfuck","twatlips",
"uglyfuck","unclefucker",
"va-j-j","vajayjay","vjayjay",
"nigaboo","niggerish","nut sack","nutsack",
"arsehead","bloody","brotherfucker","chigga","childfucker","damned",
"dickhead","fatherfucker","godsdamn","hell","jackoff","pigfucker",
"sisterfuck","sisterfucker","spastic"
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
    /\bf[\-_]+u[\-_]+c[\-_]+k\b/gi,
    /\bs[\-_]+h[\-_]+i[\-_]+t\b/gi,
    /\bb[\-_]+i[\-_]+t[\-_]+c[\-_]+h\b/gi,
    /\bd[\-_]+i[\-_]+c[\-_]+k\b/gi,
    /\bp[\-_]+u[\-_]+s[\-_]+s[\-_]+y\b/gi,
    /\bc[\-_]+u[\-_]+n[\-_]+t\b/gi,
    /\bc[\-_]+o[\-_]+c[\-_]+k\b/gi,
    /\bs\s+h\s+i\s+t\b/gi,
    /\bb\s+i\s+t\s+c\s+h\b/gi,
    /\bd\s+i\s+c\s+k\b/gi,
    /\ba[\-_]+s[\-_]+s\b/gi,
    /\bb[\-_]+o[\-_]+o[\-_]+z[\-_]+o\b/gi,
    /\bb[\-_]+u[\-_]+g[\-_]+g[\-_]+e[\-_]+r\b/gi,
    /\bd[\-_]+o[\-_]+o[\-_]+f[\-_]+u[\-_]+s\b/gi,
    /\bd[\-_]+o[\-_]+r[\-_]+k\b/gi,
    /\bd[\-_]+o[\-_]+u[\-_]+c[\-_]+h[\-_]+e\b/gi,
    /\bd[\-_]+u[\-_]+n[\-_]+c[\-_]+e\b/gi,
    /\bm[\-_]+i[\-_]+n[\-_]+d[\-_]+f[\-_]+u[\-_]+c[\-_]+k\b/gi,
    /\bn[\-_]+i[\-_]+n[\-_]+c[\-_]+o[\-_]+m[\-_]+p[\-_]+o[\-_]+o[\-_]+p\b/gi,
    /\bn[\-_]+u[\-_]+m[\-_]+b[\-_]+n[\-_]+u[\-_]+t[\-_]+s\b/gi,
    /\bn[\-_]+u[\-_]+m[\-_]+p[\-_]+t[\-_]+y\b/gi,
    /\bn[\-_]+u[\-_]+t[\-_]+j[\-_]+o[\-_]+b\b/gi,
    /\bp[\-_]+i[\-_]+s[\-_]+s\b/gi,
    /\bp[\-_]+r[\-_]+a[\-_]+t\b/gi,
    /\bs[\-_]+c[\-_]+u[\-_]+m[\-_]+b[\-_]+a[\-_]+g\b/gi,
    /\bs[\-_]+l[\-_]+u[\-_]+t\b/gi,
    /\bs[\-_]+m[\-_]+a[\-_]+r[\-_]+t[\-_]+a[\-_]+s[\-_]+s\b/gi,
    /\bt[\-_]+r[\-_]+a[\-_]+m[\-_]+p\b/gi,
    /\bw[\-_]+h[\-_]+o[\-_]+r[\-_]+e\b/gi,
    /\ba\s+s\b/gi,
    /\bb\s+o\s+o\s+z\s+o\b/gi,
    /\bb\s+u\s+g\s+g\s+e\s+r\b/gi,
    /\bd\s+o\s+o\s+f\s+u\s+s\b/gi,
    /\bd\s+o\s+r\s+k\b/gi,
    /\bd\s+o\s+u\s+c\s+h\s+e\b/gi,
    /\bd\s+u\s+n\s+c\s+e\b/gi,
    /\bm\s+i\s+n\s+d\s+f\s+u\s+c\s+k\b/gi,
    /\bn\s+i\s+n\s+c\s+o\s+m\s+p\s+o\s+o\s+p\b/gi,
    /\bn\s+u\s+m\s+b\s+n\s+u\s+t\s+s\b/gi,
    /\bn\s+u\s+m\s+p\s+t\s+y\b/gi,
    /\bn\s+u\s+t\s+j\s+o\s+b\b/gi,
    /\bp\s+i\s+s\s+s\b/gi,
    /\bp\s+r\s+a\s+t\b/gi,
    /\bs\s+c\s+u\s+m\s+b\s+a\s+g\b/gi,
    /\bs\s+l\s+u\s+t\b/gi,
    /\bs\s+m\s+a\s+r\s+t\s+a\s+s\s+s\b/gi,
    /\bt\s+r\s+a\s+m\s+p\b/gi,
    /\bw\s+h\s+o\s+r\s+e\b/gi,
    /\bb[\-_]+i[\-_]+m[\-_]+b[\-_]+o\b/gi,
    /\bc[\-_]+o[\-_]+c[\-_]+k[\-_]+w[\-_]+o[\-_]+m[\-_]+b[\-_]+l[\-_]+e\b/gi,
    /\bb\s+i\s+m\s+b\s+o\b/gi,
    /\bc\s+o\s+c\s+k\s+w\s+o\s+m\s+b\s+l\s+e\b/gi,
    // Asterisk substitutions (f*ck, c*nt, etc.)
    /\bf\*ck\b/gi,
    /\bf\*cking\b/gi,
    /\bf\*cked\b/gi,
    /\bf\*cker(s)?\b/gi,
    /\bf\*ckers\b/gi,
    /\bc\*nt\b/gi,
    /\bs\*i?t\b/gi,
    /\bb\*itch\b/gi,
    /\bd\*ck\b/gi,
    /\ba\*ss\b/gi,
    /\bp\*ssy\b/gi,
    /\bc\*ck\b/gi,
    /\bw\*ore\b/gi,
    /\bs\*ut\b/gi,
  ],

  // Site-wide text additions that should always run against page text.
  // Keep PROFANITY_DATA.words broad for reference; add deliberate runtime terms here.
  textWords: [
    'anus', 'arse', 'arsehole', 'ass', 'ass hat', 'ass jabber', 'ass pirate',
    'assbag', 'assbandit', 'assbanger', 'assbite', 'assclown', 'asscock',
    'asscracker', 'asses', 'assface', 'assfuck', 'assfucker', 'assgoblin',
    'asshat', 'asshead', 'asshole', 'asshopper', 'assjacker', 'asslick',
    'asslicker', 'assmonkey', 'assmunch', 'assmuncher', 'assnigger',
    'asspirate', 'assshit', 'assshole', 'asssucker', 'asswad', 'asswipe',
    'axwound',

    'bampot', 'bastard', 'beaner', 'beartrap', 'bitch', 'bitchass',
    'bitches', 'bitchtits', 'bitchy', 'blow job', 'blowjob', 'bollocks',
    'bollox', 'boner', 'bullshit', 'butt plug', 'butt pirate', 'buttfuck',
    'buttfucka', 'buttfucker',

    'camel toe', 'cameltoe', 'carpet muncher', 'carpetmuncher', 'chesticle',
    'chinc', 'chink', 'choad', 'chode', 'circle jerk', 'circlejerk', 'clit',
    'clitface', 'clitfuck', 'clitweasel', 'clusterfuck',
    'cock', 'cockass', 'cockbite', 'cockburger', 'cockface', 'cockfucker',
    'cockhead', 'cockjockey', 'cockknob', 'cockknoker', 'cockmaster',
    'cockmongruel', 'cockmonkey', 'cockmuncher', 'cocknugget', 'cockshit',
    'cocksmoke', 'cocksniffer', 'cocksucker', 'cockwaffle',
    'coochie', 'coochy', 'coon', 'cooter', 'cracker',
    'cumbubble', 'cumdumpster', 'cumguzzler', 'cumjockey', 'cumslut',
    'cumtart', 'cunnie', 'cunnilingus', 'cunt', 'cuntass', 'cuntbubble',
    'cuntface', 'cunthole', 'cuntlicker', 'cuntrag', 'cuntslut',

    'dago', 'damn', 'deggo', 'dick', 'dick sneeze', 'dickbag', 'dickbeaters',
    'dickface', 'dickfuck', 'dickfucker', 'dickhead', 'dickhole', 'dickjuice',
    'dickmilk', 'dickmonger', 'dicks', 'dickslap', 'dicksucker', 'dickwad',
    'dickweasel', 'dike', 'dildo', 'dipshit', 'docking', 'doochbag', 'dookie',
    'douche', 'douche fag', 'douchebag', 'douchewaffle', 'dumass', 'dumbass',
    'dumbfuck', 'dumbshit', 'dumshit', 'dyke',

    'fag', 'fagbag', 'fagfucker', 'fagging', 'faggit', 'faggot', 'faggots',
    'fagnut', 'fagtard', 'fatass', 'feltch', 'feltcher', 'feltching',
    'flamer', 'fudge packer', 'fudgepacker', 'fuck',
    'fuckass', 'fuckboy', 'fuckbrain', 'fuckbutt', 'fucked', 'fucker',
    'fuckers', 'fuckersucker', 'fuckface', 'fuckhead', 'fucking', 'fucknose',
    'fucknut', 'fucknutt', 'fuckoff', 'fucks', 'fucktard', 'fucktart',
    'fuckup',

    'gay', 'gayass', 'gaybob', 'gaydo', 'gayfuckist', 'gaylord', 'gaytard',
    'gaywad', 'gook', 'gooks', 'gooch', 'goopchute', 'gringo', 'gringos',
    'guido', 'hand job', 'handjob', 'hard on', 'heeb', 'heebs', 'ho', 'hoe',
    'hoes', 'homo', 'homodumbshit', 'honkey', 'honkeys', 'humping',
    'jap', 'japs', 'jerkass', 'jigaboo', 'jigaboos', 'jungle bunny',
    'jungle bunnies', 'junglebunny', 'junglebunnies',
    'kooch', 'kootch', 'kraut', 'krauts', 'kunt', 'kyke', 'kykes',
    'lameass', 'lardass', 'lesbian', 'lesbo', 'lezzie', 'lezzies',
    'masturbate', 'masturbated', 'masturbates', 'masturbating',
    'mcfagget', 'mick', 'micks', 'minge', 'muff diver', 'muffdiver',
    'muffdiving', 'munging',

    'nazi', 'nazis', 'negro', 'negroes', 'negroid', 'negros',
    'nig', 'nigaboo', 'nigga', 'niggah', 'niggas', 'niggaz', 'nigger',
    'niggerish', 'niggers', 'nigguh', 'niggur', 'niglet', 'nignog',
    'nig nog', 'nut sack', 'nutsack',
    'paki', 'pakis', 'panooch', 'pecker', 'peckerhead', 'peckerheads',
    'penis', 'penises', 'penisbanger', 'penisfucker', 'penispuffer',
    'piss', 'pissed', 'pissed off', 'pisses', 'pissflaps', 'pissing',
    'polesmoker', 'pollock', 'pollocks',
    'poon', 'poonani', 'poonany', 'poontang', 'punanny', 'punta',
    'porch monkey', 'porch monkeys', 'porchmonkey', 'porchmonkeys',
    'prick', 'pricks', 'pussylicking', 'puto',
    'queef', 'queer', 'queers', 'queerbait', 'queerhole',
    'renob', 'ruski',

    'scrote', 'shit', 'shitbagger', 'shitbrains', 'shitcanned', 'shitspitter',
    'shittiest', 'shiz', 'shiznit', 'skullfuck', 'smeg', 'spook', 'suckass',
    'tard', 'tards', 'testicle', 'testicles',
    'tit', 'titfuck', 'titfucker', 'titjob', 'titlicker', 'tits',
    'thundercunt', 'tittyfuck',
    'twat', 'twatlips', 'twatwaffle', 'twit', 'twits',
    'uglyfuck', 'unclefucker',
    'vag', 'vagina', 'vaginal', 'vaginas', 'va j j', 'vajayjay', 'vjayjay',
    'wank', 'wanked', 'wanker', 'wanking', 'wank job', 'wankjob',
    'wetback', 'wetbacks', 'whore', 'whores', 'wop', 'wops',

    'bloody', 'brotherfucker', 'chigga', 'childfucker', 'damned',
    'fatherfucker', 'godsdamn', 'hell', 'jackoff', 'pigfucker',
    'sisterfuck', 'sisterfucker', 'spastic'
  ],
  textPatterns: [],

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
    'home',
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

// Keep text filtering conservative. The source list above is intentionally broad
// and includes many ambiguous words, religious terms, names, places, and
// non-English ethnic terms. For page text, we only match high-confidence
// profanity/lewd terms so ordinary tweets and non-English posts are not flagged.
const CORE_TEXT_FILTER_WORDS = [
  'fuck', 'fucked', 'fucker', 'fuckers', 'fuckface', 'fuckhead', 'fuckin',
  'fucking', 'fucks', 'motherfuck', 'motherfucker', 'motherfucking',
  'mothafucka', 'mothafucker',
  'shit', 'shite', 'shits', 'shitty', 'shithead', 'bullshit', 'dipshit',
  'horseshit', 'jackshit', 'piece of shit',
  'bitch', 'bitches', 'bitching', 'bitchy', 'bitchslap',
  'asshole', 'assholes', 'arsehole', 'jackass', 'dumbass',
  'bastard', 'bugger', 'crap', 'damn', 'dammit', 'damnit',
  'dick', 'dickhead', 'dickwad', 'dickweed', 'cock', 'cocksucker',
  'cocksuckers', 'cockfoam',
  'cunt', 'twat',
  'whore', 'slut', 'sluts', 'slutty', 'skank',
  'pussy', 'pussies', 'dildo', 'vibrator',
  'porn', 'porno', 'pornography', 'pornographic', 'xxx', 'nsfw',
  'nude', 'nudity', 'naked', 'hentai', 'erotic',
  'blowjob', 'blow job', 'handjob', 'hand job', 'deepthroat',
  'deep throat', 'anal', 'anal sex', 'analsex', 'oral', 'fellatio',
  'cunnilingus', 'cum', 'semen', 'jizz',
  'onlyfans', 'fansly', 'camgirl', 'camwhore', 'sexcam',
  'sextoy', 'sex toy', 'sextoys', 'sex toys',
  'faggot', 'nigger', 'niggers', 'nigga', 'niggas',
  'chink', 'kike', 'spic', 'wetback',
  'goddamn', 'goddammit', 'goddamnit',
  // Additional high‑frequency words that were previously only in PROFANITY_DATA.words
  'boner', 'muff', 'titties', 'titty', 'knob', 'knobhead',
  'wank', 'wanker', 'wanking', 'turd', 'ballsack', 'scrotum',
  'fellatio', 'cunnilingus', 'rimjob', 'rimming', 'handjob',
  'blowjob', 'cumshot', 'creampie', 'gangbang', 'threesome',
  'bukkake', 'cuckold', 'squirting', 'fisting', 'anilingus',
  'numbnuts', 'nutjob', 'cockwomble', 'bellend', 'pillock',
  'prat', 'tosser', 'wazzack', 'mooncalf', 'doofus', 'dunce',
  'nincompoop'
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTerm(term) {
  return String(term || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildTermPattern(term) {
  const normalized = normalizeTerm(term);
  return escapeRegExp(normalized).replace(/[\s_-]+/g, '[\\s\\-_]+');
}

const UNICODE_WORD_LEFT_BOUNDARY = '(?<![\\p{L}\\p{N}])';
const UNICODE_WORD_RIGHT_BOUNDARY = '(?![\\p{L}\\p{N}])';

function mergeRegexFlags(existingFlags, requiredFlags) {
  const flags = new Set(`${existingFlags || ''}${requiredFlags || ''}`.split(''));
  if (flags.has('v')) flags.delete('u');
  return [...flags].join('');
}

function buildLiteralTermRegex(term, flags = 'gi') {
  const source = buildTermPattern(term);
  if (!source) return null;
  return new RegExp(
    `${UNICODE_WORD_LEFT_BOUNDARY}${source}${UNICODE_WORD_RIGHT_BOUNDARY}`,
    mergeRegexFlags(flags, 'u')
  );
}

const HIGH_CONFIDENCE_SOURCE_ROOTS = /(?:fuck|shit|cunt|cock|dick|pussy|slut|whore|porn|xxx|nsfw|nude|nudity|naked|hentai|dildo|vibrator|blowjob|handjob|deepthroat|fellatio|cunnilingus|jizz|semen|bukkake|creampie|gangbang|orgy|erotic|cybersex|sexcam|sexhouse|sexkitten|sexpot|sexslave|sextoy|onlyfans|faggot|nigger|nigga|chink|kike|spic|wetback|pedo|rape|rapist|incest|bestial|zoophilia|rimjob|rimming|upskirt|voyeur|topless|titt|boob)/i;

const SOURCE_WORD_DENYLIST = new Set([
  'adult', 'sex', 'sexed', 'sexing', 'sexual', 'sexually', 'sexy',
  'god', 'jesus', 'jesuschrist', 'allah',
  'cocky', 'cumquat', 'kumquat', 'nigerian', 'nigerians'
]);

function shouldUseBroadSourceWord(word) {
  const term = normalizeTerm(word);
  if (!term || term.length < 3) return false;
  if (PROFANITY_DATA.exceptions.has(term) || SOURCE_WORD_DENYLIST.has(term)) return false;
  return HIGH_CONFIDENCE_SOURCE_ROOTS.test(term);
}

function cloneRegex(regex, flags) {
  const mergedFlags = mergeRegexFlags(regex.flags, flags);
  return new RegExp(regex.source, mergedFlags);
}

function isSafeRegexSource(source) {
  if (!source || source.length > 256) return false;
  if (/\\[1-9]/.test(source)) return false;
  if (/\(\?<([=!])/.test(source)) return false;
  if (/\([^)]*(?:\+|\*|\{\d+(?:,\d*)?\})[^)]*\)(?:\+|\*|\{\d+(?:,\d*)?\})/.test(source)) {
    return false;
  }
  if (/(?:\.\*|\.\+){2,}/.test(source)) return false;
  return true;
}

function parseSlashRegex(value, flags) {
  if (!value.startsWith('/')) return null;
  const lastSlash = value.lastIndexOf('/');
  if (lastSlash <= 0) return null;

  const source = value.slice(1, lastSlash);
  const suppliedFlags = value.slice(lastSlash + 1);
  if (!isSafeRegexSource(source) || /[^gimsuyv]/.test(suppliedFlags)) return null;

  const mergedFlags = mergeRegexFlags(suppliedFlags, flags);
  try {
    return new RegExp(source, mergedFlags);
  } catch {
    return null;
  }
}

function splitCustomEntry(entry) {
  if (entry instanceof RegExp) return [entry];
  const value = String(entry || '').trim();
  if (!value) return [];
  if (value.startsWith('/')) return [value];
  return value
    .split(/[\n,]+/)
    .map(part => part.trim())
    .filter(Boolean);
}

function normalizeCustomEntries(customWords) {
  if (!customWords) return [];
  const values = Array.isArray(customWords) ? customWords : [customWords];
  return values.flatMap(splitCustomEntry);
}

function buildCustomRegex(entry, flags = 'gi') {
  if (entry instanceof RegExp) {
    return cloneRegex(entry, flags);
  }

  const rawValue = String(entry || '').trim();
  if (!rawValue) return null;

  const slashRegex = parseSlashRegex(rawValue, flags);
  if (slashRegex) return slashRegex;

  const value = normalizeTerm(rawValue);
  return buildLiteralTermRegex(value, flags);
}

function buildSourcePatternRegex(pattern, flags = 'gi') {
  if (pattern instanceof RegExp) {
    return cloneRegex(pattern, flags);
  }

  const value = String(pattern || '').trim();
  if (!value) return null;

  const slashRegex = parseSlashRegex(value, flags);
  if (slashRegex) return slashRegex;

  if (!isSafeRegexSource(value)) return null;

  try {
    return new RegExp(value, flags);
  } catch {
    return null;
  }
}

const _customRegexCache = new Map();
const _sourcePatternRegexCache = new Map();

function getCachedRegex(cache, key, flags, builder) {
  let variants = cache.get(key);
  if (!variants) {
    variants = new Map();
    cache.set(key, variants);
  }

  if (!variants.has(flags)) {
    variants.set(flags, builder(key, flags));
  }

  return variants.get(flags);
}

function getCustomRegex(entry, flags) {
  return getCachedRegex(_customRegexCache, entry, flags, buildCustomRegex);
}

function getSourcePatternRegex(pattern, flags) {
  return getCachedRegex(_sourcePatternRegexCache, pattern, flags, buildSourcePatternRegex);
}

function testRegex(regex, text) {
  if (!regex) return false;
  regex.lastIndex = 0;
  return regex.test(text);
}

function hasUnicodeWordBoundary(text, index, matchLength) {
  const before = text.slice(0, index);
  const after = text.slice(index + matchLength);
  return !/[\p{L}\p{N}]$/u.test(before) && !/^[\p{L}\p{N}]/u.test(after);
}

function testSourcePattern(regex, text) {
  if (!regex) return false;

  const matcher = regex.global ? regex : cloneRegex(regex, 'g');
  matcher.lastIndex = 0;
  let match;

  while ((match = matcher.exec(text)) !== null) {
    if (hasUnicodeWordBoundary(text, match.index, match[0].length)) return true;
    if (match[0] === '') matcher.lastIndex++;
  }

  return false;
}

function replaceRegex(text, regex) {
  if (!regex) return text;
  regex.lastIndex = 0;
  return text.replace(regex, ' ');
}

function replaceSourcePattern(text, regex) {
  if (!regex) return text;
  const matcher = regex.global ? regex : cloneRegex(regex, 'g');
  matcher.lastIndex = 0;
  return text.replace(matcher, (match, ...args) => {
    const offset = args[args.length - 2];
    return hasUnicodeWordBoundary(text, offset, match.length) ? ' ' : match;
  });
}

function cleanFilteredText(originalText, filteredText) {
  const leadingWhitespace = originalText.match(/^\s+/)?.[0] || '';
  const trailingWhitespace = originalText.match(/\s+$/)?.[0] || '';

  let core = filteredText
    .replace(/^\s+|\s+$/g, '')
    .replace(/[ \t\f\v]{2,}/g, ' ')
    .replace(/[ \t\f\v]+([,.;:!?%)\]}])/g, '$1')
    .replace(/([(\[{])[ \t\f\v]+/g, '$1')
    .replace(/([(\[{])\s*([)\]}])/g, '')
    .replace(/[ \t\f\v]{2,}/g, ' ')
    .replace(/[ \t\f\v]+\n/g, '\n')
    .replace(/\n[ \t\f\v]+/g, '\n');

  if (!core) return '';

  core = `${leadingWhitespace}${core}${trailingWhitespace}`;
  return core;
}

// ── Pre-compile regex at module load — avoids creating thousands of RegExp
//    objects on every text node check (major performance fix) ─────────────────

// Merge runtime sources, deduplicate, remove exceptions, and sort longest first.
// The broad source list is gated to high-confidence terms to avoid false positives.
const _allSources = [...new Set([
  ...CORE_TEXT_FILTER_WORDS,
  ..._ldnoobwWords,
  ...(PROFANITY_DATA.textWords || []),
  ...(PROFANITY_DATA.words || []).filter(shouldUseBroadSourceWord)
])];
const _filteredWords = _allSources
  .map(normalizeTerm)
  .filter(w => w && !PROFANITY_DATA.exceptions.has(w) && !SOURCE_WORD_DENYLIST.has(w))
  .sort((a, b) => b.length - a.length);

// Single combined regex: one pass replaces all high-confidence runtime matches.
const _wordRegex = new RegExp(
  `${UNICODE_WORD_LEFT_BOUNDARY}(${_filteredWords.map(buildTermPattern).join('|')})${UNICODE_WORD_RIGHT_BOUNDARY}`,
  'giu'
);

// ── Build evasion regex (allows non‑letter characters between letters) ──────
function buildEvasionPattern(word) {
  const chars = normalizeTerm(word)
    .replace(/[\s_-]+/g, '')
    .split('')
    .map(ch => {
      if (!/[a-z0-9]/.test(ch)) return escapeRegExp(ch);

      const fullwidthLower = String.fromCharCode(ch.charCodeAt(0) + 0xFEE0);
      if (!/[a-z]/.test(ch)) {
        return `[${escapeRegExp(ch)}${escapeRegExp(fullwidthLower)}]`;
      }

      const upper = ch.toUpperCase();
      const fullwidthUpper = String.fromCharCode(upper.charCodeAt(0) + 0xFEE0);
      return `[${escapeRegExp(ch)}${escapeRegExp(fullwidthLower)}${escapeRegExp(fullwidthUpper)}]`;
    });
  const separator = '[^\\p{L}\\p{N}]*';
  return `${UNICODE_WORD_LEFT_BOUNDARY}${chars.join(separator)}${UNICODE_WORD_RIGHT_BOUNDARY}`;
}

const COMMON_EVASION_WORDS = [
  'anus', 'arse', 'ass', 'asshole', 'bastard', 'bitch', 'bollocks',
  'cock', 'coon', 'cunt', 'dick', 'dildo', 'douchebag', 'dyke',
  'fag', 'faggot', 'fuck', 'gay', 'gook', 'heeb', 'homo', 'jap',
  'kike', 'nazi', 'negro', 'nigga', 'nigger', 'paki', 'penis',
  'piss', 'porn', 'prick', 'pussy', 'queer', 'shit', 'slut',
  'spic', 'tard', 'tit', 'tits', 'twat', 'vag', 'vagina',
  'wank', 'wetback', 'whore', 'wop'
];

// Obfuscation matching is intentionally focused. Running every dictionary term
// through one permissive regex creates severe backtracking on normal page text.
const _evasionSources = [...new Set([
  ...CORE_TEXT_FILTER_WORDS,
  ...COMMON_EVASION_WORDS
])]
  .map(normalizeTerm)
  .filter(w => w.length > 2 && !SOURCE_WORD_DENYLIST.has(w));

const _evasionPatterns = _evasionSources
  .map(buildEvasionPattern);
const _evasionRegex = new RegExp(_evasionPatterns.join('|'), 'giu');
const PATTERN_EVASION_MARKERS = /[*_#@!0-9$]/;
const POSSIBLE_EVASION_MARKERS = /[\u200B-\u200D\u2060\uFEFF\uFF01-\uFF5E]|[\p{L}][*_.\-@#$!]+[\p{L}]|\b[\p{L}](?:\s+[\p{L}]){2,}\b/u;
const BUILTIN_PATTERN_COUNT = PROFANITY_DATA.patterns.length;

// ─────────────────────────────────────────────────────────────────────────────

// Returns true if text contains any profanity
function containsProfanity(text, customWords) {
  if (!text) return false;

  _wordRegex.lastIndex = 0;
  if (_wordRegex.test(text)) return true;

  if (POSSIBLE_EVASION_MARKERS.test(text)) {
    _evasionRegex.lastIndex = 0;
    if (_evasionRegex.test(text)) return true;
  }

  // Check custom entries (literal words/phrases, comma/newline pasted lists, or /regex/flags).
  for (const entry of normalizeCustomEntries(customWords)) {
    const regex = getCustomRegex(entry, 'i');
    if (testRegex(regex, text)) return true;
  }

  if (PATTERN_EVASION_MARKERS.test(text)) {
    for (const pattern of PROFANITY_DATA.patterns.slice(0, BUILTIN_PATTERN_COUNT)) {
      const regex = getSourcePatternRegex(pattern, 'gi');
      if (testSourcePattern(regex, text)) return true;
    }
  }

  for (const pattern of PROFANITY_DATA.patterns.slice(BUILTIN_PATTERN_COUNT)) {
    const regex = getSourcePatternRegex(pattern, 'gi');
    if (testSourcePattern(regex, text)) return true;
  }

  if (PROFANITY_DATA.textPatterns && PROFANITY_DATA.textPatterns.length) {
    for (const pattern of PROFANITY_DATA.textPatterns) {
      const regex = getSourcePatternRegex(pattern, 'gi');
      if (testSourcePattern(regex, text)) return true;
    }
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
  let result = text.replace(_wordRegex, ' ');

  if (POSSIBLE_EVASION_MARKERS.test(result)) {
    _evasionRegex.lastIndex = 0;
    result = result.replace(_evasionRegex, ' ');
  }

  for (const entry of normalizeCustomEntries(customWords)) {
    result = replaceRegex(result, getCustomRegex(entry, 'gi'));
  }

  if (PATTERN_EVASION_MARKERS.test(result)) {
    for (const pattern of PROFANITY_DATA.patterns.slice(0, BUILTIN_PATTERN_COUNT)) {
      result = replaceSourcePattern(result, getSourcePatternRegex(pattern, 'gi'));
    }
  }

  for (const pattern of PROFANITY_DATA.patterns.slice(BUILTIN_PATTERN_COUNT)) {
    result = replaceSourcePattern(result, getSourcePatternRegex(pattern, 'gi'));
  }

  if (PROFANITY_DATA.textPatterns && PROFANITY_DATA.textPatterns.length) {
    for (const pattern of PROFANITY_DATA.textPatterns) {
      result = replaceSourcePattern(result, getSourcePatternRegex(pattern, 'gi'));
    }
  }

  // Return original if nothing changed — avoids triggering unnecessary DOM
  // writes and preserves whitespace-only text nodes exactly as-is
  if (result === text) return text;

  return cleanFilteredText(text, result);
}

// Export to window for use by content.js and platform scripts
window.PROFANITY_DATA = PROFANITY_DATA;
window.containsProfanity = containsProfanity;
window.removeProfanity = removeProfanity;

function hashWordList(words) {
  let hash = 2166136261;
  for (const word of words) {
    for (let index = 0; index < word.length; index++) {
      hash ^= word.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
  }
  return (hash >>> 0).toString(16);
}

// Keep the expanded list in local storage. Sync storage has a small per-item
// quota and silently drops large dictionaries.
if (
  typeof chrome !== 'undefined'
  && chrome.storage?.local
  && typeof window !== 'undefined'
  && window.top === window
) {
  try {
    const combinedProfanityWordsHash = hashWordList(_filteredWords);
    chrome.storage.local
      .get(['combinedProfanityWordsHash'])
      .then(result => {
        if (result.combinedProfanityWordsHash === combinedProfanityWordsHash) return;
        return chrome.storage.local.set({
          combinedProfanityWords: _filteredWords,
          combinedProfanityWordsHash
        });
      })
      .catch(() => {});
  } catch {
    // Storage availability must never stop page filtering.
  }
}
