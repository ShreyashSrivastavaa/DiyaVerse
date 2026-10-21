import os
import sys
import json
import re
import unicodedata
import random

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

CATEGORY_CONFIG = {
    "happiness": {"code": "HAP", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "family":    {"code": "FAM", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "love":      {"code": "LOV", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "health":    {"code": "HEA", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "success":   {"code": "SUC", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "friendship":{"code": "FRI", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "hope":      {"code": "HOP", "total": 235, "en": 130, "hi": 53, "hinglish": 52},
    "universal": {"code": "UNI", "total": 235, "en": 130, "hi": 52, "hinglish": 53},
    "funny":     {"code": "FUN", "total": 120, "en": 60,  "hi": 30, "hinglish": 30},
}

def get_word_3grams(text):
    clean = re.sub(r'[^\w\s]', '', text.lower())
    words = [w for w in clean.split() if w]
    grams = set()
    for i in range(len(words) - 2):
        grams.add(f"{words[i]} {words[i+1]} {words[i+2]}")
    return grams, " ".join(words[:6])

def jaccard(set_a, set_b):
    if not set_a and not set_b:
        return 1.0
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)

# --- ENGLISH VOCABULARY ---
CATEGORY_DATA_EN = {
    "happiness": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May every", "Let all", "May quiet", "On this Diwali, may", "Across your home, may", "As festive lamps shine, may", "May tonight's"],
        "adjectives": ["golden", "radiant", "sacred", "serene", "blessed", "joyous", "luminous", "peaceful", "cheerful", "divine", "kind", "pure", "shining", "vibrant", "sweet", "sparkling"],
        "nouns": ["diyas", "flames", "lights", "lamps", "glows", "sparks", "embers", "hearths", "candles", "radiances", "twinkles", "lusters", "lanterns", "glimmers"],
        "verbs": ["bring", "awaken", "shower", "fill", "nurture", "spread", "bestow", "infuse", "radiate", "welcome", "foster", "inspire", "sweeten", "brighten"],
        "objects": ["pure laughter", "deep satisfaction", "cheerful merriment", "gentle gladness", "boundless elation", "sunny contentment", "festive cheer", "smiling peace", "luminous delight", "heartfelt joy"],
        "places": ["within living rooms", "across thresholds", "inside peaceful hearts", "throughout dwellings", "in quiet corners", "under festive roofs", "upon life journeys", "across courtyards", "beside glowing lamps"],
        "endings": ["and brighten your quiet mornings.", "throughout this peaceful festival season.", "leaving pure joy in every room.", "with radiant smiles on all faces.", "and sweet festive memories to cherish.", "bringing harmony to every turning hour.", "making this Deepavali truly unforgettable.", "keeping your spirit vibrant and bright.", "welcoming good fortune and good cheer.", "freeing your outlook from all worry."]
    },
    "family": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May every", "Let all", "Across family rooms, may", "As household lamps glow, may", "May your loved ones find", "In your family hearth, may"],
        "adjectives": ["tender", "united", "ancestral", "loving", "sacred", "warm", "peaceful", "gentle", "reverent", "cherished", "enduring", "protective", "harmonious", "deep"],
        "nouns": ["bonds", "traditions", "prayers", "gatherings", "blessings", "feasts", "memories", "embraces", "roots", "ties", "stories", "lanterns", "flames"],
        "verbs": ["unite", "strengthen", "protect", "shelter", "enrich", "bind", "gather", "nurture", "foster", "renew", "bless", "support"],
        "objects": ["parents and children", "all generations", "family elders and youth", "every sibling and relative", "your entire household", "dear kith and kin", "every member of the family"],
        "places": ["around the dining table", "under one peaceful roof", "in mutual understanding", "with heartfelt reverence", "beside traditional rangolis", "within loving embraces", "across family gatherings"],
        "endings": ["under the protective festive glow.", "making this celebration deeply memorable.", "strengthening your ancestral roots.", "for years of shared happiness.", "keeping your home deeply blessed.", "enriching every shared tomorrow.", "in peaceful and loving harmony."]
    },
    "love": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May tender", "Across your shared life, may", "As romantic lamps flicker, may", "Between two devoted souls, may", "May the quiet flame of"],
        "adjectives": ["romantic", "tender", "devoted", "gentle", "enduring", "sweet", "patient", "harmonious", "compassionate", "unconditional", "radiant", "faithful"],
        "nouns": ["affection", "devotion", "whispers", "promises", "glances", "understanding", "companionship", "smiles", "trust", "harmony", "sanctuary"],
        "verbs": ["deepen", "ignite", "nurture", "protect", "bless", "illuminate", "sweeten", "weave", "comfort", "strengthen", "guide"],
        "objects": ["two loving hearts", "your sacred partnership", "your shared journey", "each romantic moment", "mutual trust and faith", "tender lifelong companionship", "your quiet sanctuary"],
        "places": ["through life's seasons", "in gentle harmony", "hand in hand together", "under soft starlight", "through every passing dusk", "across all future days", "within a loving embrace"],
        "endings": ["making every moment profoundly sweet.", "this Diwali and forevermore.", "under heaven's luminous blessings.", "as your journey continues in love.", "blessing your united dreams."]
    },
    "health": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May quiet", "Across your daily life, may", "As soothing lamps burn, may", "For your body and mind, may", "May wholesome"],
        "adjectives": ["restorative", "healing", "wholesome", "calming", "peaceful", "sound", "invigorating", "resilient", "gentle", "pure", "youthful", "cleansing", "balanced"],
        "nouns": ["vitality", "calm", "nutrition", "stillness", "energy", "serenity", "endurance", "breath", "poise", "strength", "wellness", "renewal"],
        "verbs": ["restore", "cleanse", "strengthen", "refresh", "nourish", "rejuvenate", "invigorate", "shield", "protect", "heal", "revitalize"],
        "objects": ["your physical stamina", "peace of mind and body", "natural inner resilience", "restful tranquil sleep", "unburdened clear thoughts", "wholesome sound wellness", "your natural vigor"],
        "places": ["throughout each morning", "during peaceful evening walks", "free from all fatigue", "within a tranquil mind", "across every daily task", "in wholesome balance"],
        "endings": ["for a vibrant and flourishing year.", "keeping your mind calm and sound.", "nurturing lifelong wholesome wellness.", "embracing your body with healing calm.", "freeing your spirit from all fatigue."]
    },
    "success": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May golden", "In your professional career, may", "As ambitious lamps shine, may", "For your noble endeavors, may", "May bold"],
        "adjectives": ["prosperous", "triumphant", "flourishing", "honorable", "creative", "golden", "purposeful", "visionary", "steadfast", "fruitful", "unwavering", "dignified"],
        "nouns": ["opportunities", "breakthroughs", "milestones", "ventures", "enterprises", "rewards", "achievements", "pathways", "insights", "perseverance", "foresight"],
        "verbs": ["unlock", "reward", "guide", "elevate", "crown", "transform", "empower", "illuminate", "expand", "foster", "advance"],
        "objects": ["your honest hard work", "noble career aspirations", "creative new projects", "worthwhile business goals", "patient daily discipline", "ambitious life pursuits"],
        "places": ["with deserved recognition", "across promising avenues", "surpassing every expectation", "with high ethical honor", "toward inspiring peaks", "in flourishing ventures"],
        "endings": ["in this glorious festive year.", "surpassing every past expectation.", "with honor, prosperity, and joy.", "and light up your life's work.", "as you scale inspiring new heights."]
    },
    "friendship": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May cheerful", "Among faithful buddies, may", "As celebratory lamps glow, may", "Between longtime pals, may", "May loyal"],
        "adjectives": ["loyal", "trusted", "cheerful", "nostalgic", "steadfast", "honest", "companionable", "warm", "vibrant", "unbreakable", "lifelong", "kind"],
        "nouns": ["camaraderie", "banter", "reunions", "chats", "memories", "laughter", "support", "circles", "bonds", "smiles", "mischief"],
        "verbs": ["rekindle", "strengthen", "celebrate", "enrich", "brighten", "bridge", "honor", "nurture", "gather", "cheer"],
        "objects": ["cherished childhood memories", "loyal companions through storms", "unbreakable ties of trust", "fun chats over festival sweets", "honest brotherly support", "sparkling circles of friends"],
        "places": ["across miles and busy seasons", "around festive snack tables", "through lively banter and laughs", "in heartwarming reunions", "beside evening diyas"],
        "endings": ["making this Diwali truly cheerful.", "because good friends make life glow.", "through all life's changing tides.", "sharing festive treats and smiles.", "and keeping your bond unbreakable."]
    },
    "hope": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May brave", "When shadows fall softly, may", "As morning lamps awaken, may", "In the quiet of dawn, may", "May unshakeable"],
        "adjectives": ["courageous", "optimistic", "radiant", "undefeated", "inspiring", "bright", "firm", "luminous", "steadfast", "renewing", "sacred", "resilient"],
        "nouns": ["faith", "confidence", "whispers", "optimism", "conviction", "promises", "possibilities", "horizons", "wings", "resolves", "sunrises"],
        "verbs": ["whisper", "reignite", "awaken", "inspire", "unfurl", "restore", "plant", "guide", "breathe", "kindle"],
        "objects": ["courage into weary hearts", "boundless faith for tomorrow", "fresh confidence in the future", "bright possibilities ahead", "unshakeable inner resolve", "peaceful optimistic dreams"],
        "places": ["promising that dawn arrives", "where dreams find strong wings", "turning pages toward light", "through every dark passage", "with gentle clarity and calm"],
        "endings": ["illuminating a magnificent new chapter.", "this Diwali and in every coming dawn.", "with gentle clarity and quiet grace.", "giving your spirit wings to soar.", "promising a luminous and kind future."]
    },
    "universal": {
        "starters": ["May", "Let", "Wishing that", "We pray that", "May sacred", "Across all continents and lands, may", "Beneath the starry sky, may", "For every soul on earth, may", "May collective"],
        "adjectives": ["universal", "brotherly", "healing", "compassionate", "peaceful", "selfless", "generous", "sacred", "global", "uniting", "protective", "just"],
        "nouns": ["harmony", "goodwill", "brotherhood", "sustenance", "charity", "prayers", "empathy", "light", "solidarity", "mercy", "peace"],
        "verbs": ["radiate", "touch", "dispel", "unite", "nurture", "wrap", "heal", "bless", "inspire", "foster"],
        "objects": ["every humble threshold", "destitute and lonely souls", "diverse communities in peace", "all nations across our world", "the welfare of all living beings", "the hungry and vulnerable"],
        "places": ["under one shared starry sky", "dispelling harsh prejudice", "with generosity and kindness", "in sacred global brotherhood", "across all earthly borders"],
        "endings": ["for the welfare of all humankind.", "blessing every corner of our earth.", "under the gentle gaze of starlight.", "in sacred harmony and global peace.", "making our world a kinder home."]
    },
    "funny": {
        "starters": ["May", "Let", "Wishing that", "Here is hoping that", "May this Diwali", "On this feast-filled day, may", "Between snack rounds, may", "May festive humor"],
        "adjectives": ["tactical", "heroic", "diplomatic", "secret", "peaceful", "unlimited", "speedy", "stealthy", "delicious", "cheerful"],
        "nouns": ["permissions", "missions", "patience", "escapes", "nap-times", "tricks", "strategies", "feasts", "snack-stashes"],
        "verbs": ["grant", "help", "save", "allow", "ensure", "give", "protect", "reward"],
        "objects": ["you immunity from calorie counting", "you re-gift soan papdi swiftly", "you dodge awkward relative questions", "your clothes remain syrup-free", "you claim the last kaju katli", "you get hot fresh jalebis first"],
        "places": ["while untangling fairy lights", "during marathon family visits", "beside overflowing snack plates", "without feeling guilty at all", "in the middle of festive chaos"],
        "endings": ["Happy Diwali and enjoy the feast!", "wishing you minimal chores and maximum mithai!", "may your sweet tooth be fully satisfied!", "cheers to festive survival and sweet joy!"]
    }
}

# --- HINDI VOCABULARY ---
CATEGORY_DATA_HI = {
    "happiness": {
        "starters": ["इस दिवाली", "यह पावन", "दीपों की", "आपके लिए", "हर दीया", "घर में", "सदा", "शुभ", "ईश्वर करे", "खुशियों की", "प्रेम से", "मन में", "दहलीज पर", "आंगन में", "सुख और", "शांति की", "सच्ची", "अनमोल", "पावन", "उज्ज्वल", "सुनहरी", "मंगलमय", "दिव्य"],
        "adjectives": ["सुनहरी", "पावन", "उज्ज्वल", "दिव्य", "मंगलमयी", "सुखद", "मधुर", "शांत", "निर्मल", "पवित्र", "चमकीली", "अनुपम", "मनमोहक", "आनंदमयी", "शुभ", "मनोहर", "सौम्य", "शीतल", "ज्योतिर्मयी", "कल्याणकारी"],
        "nouns": ["रोशनी", "जगमगाहट", "किरण", "ज्योति", "प्रभा", "आभा", "दमक", "चमक", "छटा", "कांति", "लौ", "लहर", "महक", "मिठास", "तरंग"],
        "places": ["घर-आंगन में", "जीवन के हर कोने में", "मन के मंदिर में", "सपरिवार जीवन में", "हर नए दिन में", "दहलीज के भीतर", "समस्त संसार में"],
        "verbs": ["बिखेरे", "लाए", "भरे", "संचार करे", "प्रदान करे", "सजाए", "आलोकित करे", "महकाए", "रोशन करे"],
        "endings": ["शुभ दीपावली सपरिवार।", "सदा मुस्कुराते रहें।", "दीपावली मंगलमय हो।", "सुखद दीपोत्सव शुभकामनाएं।", "खुशियों भरा त्योहार हो।"]
    },
    "family": {
        "starters": ["इस दीपोत्सव", "परिवार में", "अपनों के संग", "घर के भीतर", "सदा", "सपरिवार", "पावन बेला में", "बड़ों का", "दीपावली पर", "रिश्तों में", "घर-आंगन में", "प्रेम से", "दहलीज पर", "हर सदस्य के"],
        "adjectives": ["अटूट", "निस्वार्थ", "मधुर", "पावन", "स्नेहमयी", "गहरा", "आत्मीय", "अनमोल", "सुंदर", "पवित्र"],
        "nouns": ["स्नेह", "प्रेम", "आशीर्वाद", "विश्वास", "अपनत्व", "एकता", "सद्भाव", "आदर", "सम्मान", "दुलार"],
        "places": ["सारे परिवार में", "घर के हर सदस्य के दिल में", "रिश्तों की डोर में", "घर के आंगन में", "बड़ों और बच्चों के संग"],
        "verbs": ["प्रगाढ़ बनाए", "सदा बनाए रखे", "बरकरार रखे", "और गहरा करे", "सुरक्षित रखे", "जीवित रखे"],
        "endings": ["सपरिवार शुभ दीपावली!", "घर में सदा सुख-शांति रहे।", "मंगलमय दीपोत्सव सपरिवार।", "सुखी रहे आपका परिवार।"]
    },
    "love": {
        "starters": ["दो दिलों के", "प्रेम की इस", "साथ बिताए", "दीपावली की", "शांत बेला में", "जीवन साथी संग", "मधुर यादों से", "सदा", "प्रेम भरा", "विश्वास के संग", "हृदय में"],
        "adjectives": ["कोमल", "गहरा", "असीम", "मधुर", "पवित्र", "अनंत", "सच्चा", "निर्मल", "सुहावना"],
        "nouns": ["समर्पण", "विश्वास", "स्नेह", "अनुराग", "रोमांस", "साथ", "समझदारी", "दुलार"],
        "places": ["आप दोनों के जीवन में", "हर खूबसूरत पल में", "आपके दांपत्य सफर में", "हृदय के मंदिर में"],
        "verbs": ["घोल दे", "सजाए", "रोशन रखे", "मजबूत बनाए", "सदा खिलाए", "महकाए"],
        "endings": ["प्रेममय दीपावली की बधाई।", "सदा बना रहे आपका सुंदर साथ।", "शुभ दीपावली मेरे हमसफर।", "प्यार और रोशनी बनी रहे।"]
    },
    "health": {
        "starters": ["आरोग्य के इस", "दीपावली पर", "ईश्वर से प्रार्थना", "दीपों की ऊर्जा", "स्वस्थ जीवन के", "तन और मन में", "सदा", "शुभ घड़ी में", "निरोगी काया के"],
        "adjectives": ["उत्तम", "दीर्घ", "निरोगी", "संतुलित", "ऊर्जावान", "शांत", "पुष्ट", "स्वस्थ"],
        "nouns": ["स्वास्थ्य", "काया", "आयु", "स्फूर्ति", "शांति", "दीर्घायु", "आरोग्य", "ऊर्जा"],
        "places": ["तन और मन दोनों में", "प्रतिदिन की दिनचर्या में", "जीवन के हर पड़ाव पर", "सकारात्मक विचारों के साथ"],
        "verbs": ["प्रदान करे", "का वरदान दे", "बनाए रखे", "संचार करे", "विकसित करे", "पुष्ट करे"],
        "endings": ["आरोग्यमय दीपावली हो।", "सदा स्वस्थ और प्रसन्न रहें।", "स्वस्थ दीपावली मंगलमय हो।", "आरोग्य का वरदान मिले।"]
    },
    "success": {
        "starters": ["कर्मक्षेत्र में", "सफलता की नई", "व्यापार में", "दीपावली का प्रकाश", "ज्ञान और विद्या के", "सदा", "शुभ मुहूर्त में", "मेहनत के संग", "प्रगति के पथ पर"],
        "adjectives": ["अपार", "नई", "शानदार", "स्थायी", "कीर्तिमान", "अद्वितीय", "समृद्ध", "विजयी"],
        "nouns": ["सफलता", "उन्नति", "प्रगति", "समृद्धि", "उपलब्धियां", "कीर्ति", "विजय", "ऊंचाइयां"],
        "places": ["कार्यक्षेत्र और व्यापार में", "आपके हर नेक संकल्प में", "करियर के हर मोड़ पर", "परिश्रम के हर मार्ग में"],
        "verbs": ["प्रदान करे", "के द्वार खोले", "दिलाए", "सिद्ध कराए", "चमकाए", "आसान करे"],
        "endings": ["शुभ दीपावली और नई प्रगति!", "समृद्धि आपके कदम चूमे।", "विजयी भव, शुभ दीपोत्सव।", "सफलता मुबारक हो आपको।"]
    },
    "friendship": {
        "starters": ["सच्चे यारों संग", "बचपन की यादों", "दोस्ती के इस", "यारों की महफिल", "सदा", "मित्रता की डोर", "पुराने दोस्तों के", "याराना के संग"],
        "adjectives": ["सच्ची", "अनमोल", "अटूट", "मस्त", "सदाबहार", "गहरी", "वफादार"],
        "nouns": ["यारी", "दोस्ती", "मस्ती", "यादें", "मुस्कान", "साझेदारी", "चर्चा"],
        "places": ["जिंदगी के हर सफर में", "यारों की महफिल में", "सुख और दुख के हर मोड़ पर", "दूर रहकर भी दिलों में"],
        "verbs": ["ताज़ा करे", "सदा बनाए रखे", "और पक्की करे", "रोशन रखे", "महकाए", "जोड़े रखे"],
        "endings": ["दोस्त, शुभ दीपावली तुम्हें!", "यारी सदा यूं ही जगमगाए।", "हैप्पी दिवाली मेरे यार।", "दोस्ती का पर्व मुबारक।"]
    },
    "hope": {
        "starters": ["घने अंधेरे में", "निराशा के बाद", "सपनों की राह", "उम्मीदों के संग", "सदा", "हौसलों की नई", "नई सुबह के", "विश्वास के साथ"],
        "adjectives": ["अदम्य", "नई", "उज्ज्वल", "अटूट", "दृढ़", "आशावान", "साहसी"],
        "nouns": ["उम्मीद", "साहस", "हौसला", "दिशा", "विश्वास", "सवेरा", "किरण"],
        "places": ["कठिन राहों के बीच भी", "आपके सपनों की राह में", "हृदय के हर कोने में", "भविष्य की नई सुबह में"],
        "verbs": ["जगाए", "प्रदान करे", "दिखाए", "भर दे", "रोशन रखे", "मजबूत करे"],
        "endings": ["आशावान दीपावली शुभकामनाएं।", "शुभ और उज्ज्वल सवेरा हो।", "नई शुरुआत मुबारक हो।", "उम्मीदें सदा रोशन रहें।"]
    },
    "universal": {
        "starters": ["समस्त संसार में", "विश्व शांति के", "धरती के हर", "प्राणीमात्र के लिए", "सदा", "मानवता के हित", "सर्वजन के लिए", "वसुधैव कुटुम्बकम् के"],
        "adjectives": ["वैश्विक", "पवित्र", "निर्मल", "सच्ची", "समान", "कल्याणकारी", "अहिंसक"],
        "nouns": ["शांति", "सद्भाव", "भाईचारा", "करुणा", "अहिंसा", "सद्भावना", "दया"],
        "places": ["पूरी मानव जाति के बीच", "हर अभावग्रस्त आंगन में", "समस्त जीव-जंतुओं के लिए", "धरती के कोने-कोने में"],
        "verbs": ["फैलाए", "का संचार करे", "स्थापित करे", "जागृत करे", "बढ़ाए", "भर दे"],
        "endings": ["विश्व शांति की मंगलकामना।", "शुभ और कल्याणकारी दिवाली।", "शांति और प्रेम का वास हो।", "समस्त जगत का मंगल हो।"]
    },
    "funny": {
        "starters": ["सफाई से बचकर", "मिठाई के डिब्बे", "काजू कतली के", "पटाखों से दूर", "सदा", "रिलैक्स मूड में", "डाइट भूलकर"],
        "adjectives": ["पहला", "भरपेट", "मस्त", "शांतिपूर्ण", "बिना गिल्ट का", "स्वादिष्ट"],
        "nouns": ["हक", "आनंद", "सुकून", "स्वाद", "छुटकारा", "लजीज स्वाद"],
        "places": ["काजू कतली के डिब्बे पर", "मिठाइयों की प्लेट में", "सोफे पर आराम फरमाते हुए", "नाश्ते की मेज पर"],
        "verbs": ["दिलाए", "उपलब्ध कराए", "का सुख दे", "सुलझाए", "आसान बनाए"],
        "endings": ["मस्त और मीठी दीपावली!", "मजेदार और स्वादिष्ट त्योहार हो।", "हैप्पी दिवाली, मस्त रहो!"]
    }
}

# --- HINGLISH VOCABULARY ---
CATEGORY_DATA_HINGLISH = {
    "happiness": {
        "starters": ["Is Diwali par", "Deepon ki shaam", "Mithai ke sath", "Shubh din par", "Doorstep par jalta", "Festive vibes mein", "Dil se prarthna", "Ghar ke aangan mein", "Yeh celebration aapke"],
        "adjectives": ["dher saari", "pure", "sparkling", "positive", "golden", "khoobsurat", "bright", "cheerful"],
        "nouns": ["khushiyan", "smile", "sukoon", "vibes", "enjoyment", "laughter", "masti", "delight"],
        "places": ["aapki daily life mein", "ghar ke har room mein", "family ke sath sath", "dil ke andar", "aangan ke chaaron taraf"],
        "verbs": ["lekar aaye", "se bhar de", "provide kare", "gift kare", "spread kare", "multiply kare"],
        "endings": ["Happy Diwali to you and family!", "Khushiyon bhara tyohar ho!", "Stay blessed and happy always!", "Dil se Diwali mubarak ho!"]
    },
    "family": {
        "starters": ["Family tyohar par", "Badon ke aashirwaad", "Apno ke sath", "Deepavali par ghar", "Sath mein celebrate", "Parivaar ke liye", "Festive dinner par", "Ghar ke sabhi"],
        "adjectives": ["sweet", "unbreakable", "sacred", "loving", "warm", "pure", "honest"],
        "nouns": ["memories", "togetherness", "pyar", "apnapan", "respect", "care", "bonds"],
        "places": ["parivaar ke rishton mein", "aangan aur dehleez par", "family dining table par", "ghar ke har kone mein"],
        "verbs": ["hamesha banaye rakhe", "aur strong kare", "ghol de", "barkarar rakhe", "protect kare"],
        "endings": ["Poore parivaar ko Happy Diwali!", "Ghar hamesha aabaad rahe!", "Festive greetings to the family!"]
    },
    "love": {
        "starters": ["Aap dono ke liye", "Love aur light", "Ek doosre ke", "Romantic festive shaam", "Dono dilon mein", "Sath beete lamhe", "Diye ki lau sang", "Zindagi ke safar mein"],
        "adjectives": ["tender", "deep", "romantic", "pure", "evergreen", "sweet", "gentle"],
        "nouns": ["understanding", "pyar", "trust", "care", "togetherness", "romance", "affection"],
        "places": ["shared journey mein", "har din aur har shaam", "dilon ke darmiyan", "sweet memories mein"],
        "verbs": ["aur gehra kare", "sada banaye rakhe", "mehka de", "roshan rakhe", "protect kare"],
        "endings": ["Happy Diwali, stay in love!", "Love and light to both of you!", "Wishing you romantic moments!"]
    },
    "health": {
        "starters": ["Good health ke liye", "Body aur mind", "Positive health vibes", "Stress-free lifestyle", "Fit life ke liye", "Swasth shareer aur", "Daily routine mein", "Peaceful mornings ke sath"],
        "adjectives": ["fit", "sound", "fresh", "active", "energetic", "healthy", "balanced"],
        "nouns": ["health", "peace of mind", "tandarusti", "energy", "fitness", "stamina", "wellness"],
        "places": ["aapki routine life mein", "body aur mind dono mein", "daily habits ke sath", "har ek din mein"],
        "verbs": ["gift kare", "hamesha provide kare", "se bhar de", "ka vardaan de", "maintain kare"],
        "endings": ["Healthy and prosperous Diwali!", "Stay healthy and active always!", "Swasth Diwali ki shubhkaamnayein!"]
    },
    "success": {
        "starters": ["Career aur growth", "Hard work aur", "Naye projects ke", "Progress ke tyohar", "Golden chances ke", "Success ke path par", "Mehnat ke sath sath", "Aim achieve karne"],
        "adjectives": ["shandaar", "great", "golden", "massive", "fruitful", "historic", "inspiring"],
        "nouns": ["success", "growth", "opportunities", "achievements", "milestones", "praise", "confidence"],
        "places": ["career aur business mein", "har naye venture ke dauran", "professional field mein", "aane wale time mein"],
        "verbs": ["provide kare", "ke raste khole", "dilaaye", "tak pahunchaye", "multiply kare"],
        "endings": ["Great success and Happy Diwali!", "Best wishes for great achievements!", "May you keep growing higher!"]
    },
    "friendship": {
        "starters": ["Doston ke sang", "Yaaron ke sath", "True friendship ke", "College yaadon ke", "Best buddy ke liye", "Yaari ki pyari", "Masti bhari shaam", "Banter aur talks mein"],
        "adjectives": ["crazy", "unbreakable", "honest", "awesome", "true", "nostalgic", "sweet"],
        "nouns": ["dosti", "yaari", "banter", "laughter", "memories", "fun", "chats"],
        "places": ["doston ke group mein", "late night chats ke sath", "life ke har mod par", "sweet treats khate hue"],
        "verbs": ["taza kare", "aur pakki kare", "celebrate kare", "jagmagaye", "strong banaye"],
        "endings": ["Happy Diwali mere yaar!", "Cheers to our unbreakable bond!", "Best festive wishes to buddy!"]
    },
    "hope": {
        "starters": ["Nayi umeed ke", "Darkness ke baad", "Dreams complete karne", "Har problem ko", "Nayi subah ke", "Strong belief ke", "Optimistic thoughts sang", "Confidence ke sath"],
        "adjectives": ["bright", "strong", "positive", "firm", "hopeful", "inspiring", "brave"],
        "nouns": ["umeed", "courage", "confidence", "direction", "guidance", "positivity", "rays"],
        "places": ["future ke raste par", "mann ke vishwas mein", "har mushkil mod par", "life ke agle chapter mein"],
        "verbs": ["ka diya jalaye", "provide kare", "dikhaye", "paida kare", "blooming banaye"],
        "endings": ["Hopeful and bright Diwali!", "New beginnings are waiting for you!", "Keep your spirit shining always!"]
    },
    "universal": {
        "starters": ["Duniya bhar mein", "Har aangan mein", "Insaniyat ke liye", "Sabhi deshon mein", "World peace ke", "Universal brotherhood sang", "Har kisi ke liye", "Quiet harmony ke"],
        "adjectives": ["universal", "peaceful", "compassionate", "selfless", "kind", "honest", "global"],
        "nouns": ["peace", "aman", "brotherhood", "harmony", "kindness", "goodwill", "support"],
        "places": ["duniya ke har aangan mein", "insaniyat ke dil mein", "all over the world", "har ghar ke doorstep par"],
        "verbs": ["laaye", "phailaye", "jode", "bless kare", "establish kare"],
        "endings": ["Universal peace and joy to all!", "Happy and peaceful Diwali!", "Spreading light everywhere!"]
    },
    "funny": {
        "starters": ["Calories count kiye", "Cleaning se bachkar", "Soan papdi box", "Patakho ke shor", "Snack table ke", "Mithai khate hue", "Diet plan ko", "Aaram se blanket"],
        "adjectives": ["unlimited", "peaceful", "stealthy", "sweet", "speedy", "tasty", "relaxed"],
        "nouns": ["mithai", "chutti", "masti", "relaxation", "escape", "jalebis", "treats"],
        "places": ["mithai ke box ke samne", "sofe par let kar", "snack table par", "relatives ke aage"],
        "verbs": ["enjoy karne de", "ka licence de", "ka chance dilaaye", "secure kare"],
        "endings": ["Happy sweet tooth Diwali!", "Enjoy the funny festive drama!", "Happy fun-filled Diwali!"]
    }
}

def generate_english(cat, target):
    wishes = []
    seen_first_six = set()
    data = CATEGORY_DATA_EN[cat]
    
    random.seed(100 + len(cat))
    attempts = 0
    while len(wishes) < target and attempts < 100000:
        attempts += 1
        st = random.choice(data["starters"])
        adj = random.choice(data["adjectives"])
        noun = random.choice(data["nouns"])
        v = random.choice(data["verbs"])
        obj = random.choice(data["objects"])
        plc = random.choice(data["places"])
        end = random.choice(data["endings"])
        
        text = f"{st} {adj} {noun} {v} {obj} {plc} {end}"
        text = re.sub(r'\s+', ' ', text).strip()
        
        if len(text) < 40 or len(text) > 140:
            continue
            
        grams, first_six = get_word_3grams(text)
        if first_six in seen_first_six:
            continue
            
        too_sim = False
        for existing in wishes:
            sim = jaccard(grams, existing["grams"])
            if sim > 0.50:
                too_sim = True
                break
                
        if not too_sim:
            seen_first_six.add(first_six)
            wishes.append({"text": text, "grams": grams, "first_six": first_six})
            
    if len(wishes) < target:
        raise RuntimeError(f"Could not reach {target} English wishes for {cat}, got {len(wishes)}")
    return [w["text"] for w in wishes]

def generate_hindi(cat, target):
    wishes = []
    seen_first_six = set()
    data = CATEGORY_DATA_HI[cat]
    
    random.seed(200 + len(cat))
    attempts = 0
    while len(wishes) < target and attempts < 100000:
        attempts += 1
        st = random.choice(data["starters"])
        adj = random.choice(data["adjectives"])
        noun = random.choice(data["nouns"])
        plc = random.choice(data["places"])
        v = random.choice(data["verbs"])
        end = random.choice(data["endings"])
        
        text = f"{st} {adj} {noun} {plc} {v}, {end}"
        text = re.sub(r'\s+', ' ', text).strip()
        
        if len(text) < 66 or len(text) > 135:
            continue
            
        grams, first_six = get_word_3grams(text)
        if first_six in seen_first_six:
            continue
            
        too_sim = False
        for existing in wishes:
            sim = jaccard(grams, existing["grams"])
            if sim > 0.50:
                too_sim = True
                break
                
        if not too_sim:
            seen_first_six.add(first_six)
            wishes.append({"text": text, "grams": grams, "first_six": first_six})
            
    if len(wishes) < target:
        raise RuntimeError(f"Could not reach {target} Hindi wishes for {cat}, got {len(wishes)}")
    return [w["text"] for w in wishes]

def generate_hinglish(cat, target):
    wishes = []
    seen_first_six = set()
    data = CATEGORY_DATA_HINGLISH[cat]
    
    random.seed(300 + len(cat))
    attempts = 0
    while len(wishes) < target and attempts < 100000:
        attempts += 1
        st = random.choice(data["starters"])
        adj = random.choice(data["adjectives"])
        noun = random.choice(data["nouns"])
        plc = random.choice(data["places"])
        v = random.choice(data["verbs"])
        end = random.choice(data["endings"])
        
        text = f"{st} {adj} {noun} {plc} {v}, {end}"
        text = re.sub(r'\s+', ' ', text).strip()
        
        if len(text) < 45 or len(text) > 135:
            continue
            
        grams, first_six = get_word_3grams(text)
        if first_six in seen_first_six:
            continue
            
        too_sim = False
        for existing in wishes:
            sim = jaccard(grams, existing["grams"])
            if sim > 0.50:
                too_sim = True
                break
                
        if not too_sim:
            seen_first_six.add(first_six)
            wishes.append({"text": text, "grams": grams, "first_six": first_six})
            
    if len(wishes) < target:
        raise RuntimeError(f"Could not reach {target} Hinglish wishes for {cat}, got {len(wishes)}")
    return [w["text"] for w in wishes]

def main():
    wishes_dir = os.path.join(os.path.dirname(__file__), "..", "data", "wishes")
    os.makedirs(wishes_dir, exist_ok=True)
    
    review_lines = [
        "# DiyaVerse Hindi & Hinglish Wishes for Human Review\n\n",
        "All Hindi (450) and Hinglish (450) wishes flagged for proofreading before launch.\n\n"
    ]
    
    total_wishes = 0
    for cat, conf in CATEGORY_CONFIG.items():
        print(f"Generating category '{cat}': en={conf['en']}, hi={conf['hi']}, hinglish={conf['hinglish']}...")
        en_list = generate_english(cat, conf["en"])
        hi_list = generate_hindi(cat, conf["hi"])
        hinglish_list = generate_hinglish(cat, conf["hinglish"])
        
        cat_items = []
        c = 1
        for txt in en_list:
            cat_items.append({
                "id": f"W-{conf['code']}-{str(c).zfill(4)}",
                "text": txt,
                "category": cat,
                "language": "en",
                "tags": [cat, "diwali"],
                "tone": "lighthearted" if cat == "funny" else "warm",
                "length": len(txt),
                "active": True,
                "version": 1
            })
            c += 1
            
        for txt in hi_list:
            wid = f"W-{conf['code']}-{str(c).zfill(4)}"
            cat_items.append({
                "id": wid,
                "text": txt,
                "category": cat,
                "language": "hi",
                "tags": [cat, "hindi", "diwali"],
                "tone": "lighthearted" if cat == "funny" else "warm",
                "length": len(txt),
                "active": True,
                "version": 1
            })
            review_lines.append(f"- [ ] **{wid}** ({cat}, hi): \"{txt}\"\n")
            c += 1
            
        for txt in hinglish_list:
            wid = f"W-{conf['code']}-{str(c).zfill(4)}"
            cat_items.append({
                "id": wid,
                "text": txt,
                "category": cat,
                "language": "hinglish",
                "tags": [cat, "hinglish", "diwali"],
                "tone": "lighthearted" if cat == "funny" else "warm",
                "length": len(txt),
                "active": True,
                "version": 1
            })
            review_lines.append(f"- [ ] **{wid}** ({cat}, hinglish): \"{txt}\"\n")
            c += 1
            
        out_file = os.path.join(wishes_dir, f"{cat}.json")
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(cat_items, f, ensure_ascii=False, indent=2)
        print(f"  -> Successfully saved {len(cat_items)} wishes to {out_file}")
        total_wishes += len(cat_items)
        
    review_file = os.path.join(os.path.dirname(__file__), "..", "REVIEW.md")
    with open(review_file, "w", encoding="utf-8") as f:
        f.writelines(review_lines)
        
    print(f"\nSUCCESS! Generated exactly {total_wishes} wishes across all 9 categories.")

if __name__ == "__main__":
    main()
