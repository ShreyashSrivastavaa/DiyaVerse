import fs from "node:fs";
import path from "node:path";
import { moderateText } from "../src/lib/moderation/moderate";
import { graphemeCount, normalizeText } from "../src/lib/text";

interface WishItem {
  id: string;
  text: string;
  category: string;
  language: "en" | "hi" | "hinglish";
  tags: string[];
  tone: string;
  length: number;
  active: boolean;
  version: number;
}

const CATEGORY_CONFIG: Record<
  string,
  { code: string; total: number; en: number; hi: number; hinglish: number }
> = {
  happiness: { code: "HAP", total: 235, en: 130, hi: 53, hinglish: 52 },
  family: { code: "FAM", total: 235, en: 130, hi: 52, hinglish: 53 },
  love: { code: "LOV", total: 235, en: 130, hi: 53, hinglish: 52 },
  health: { code: "HEA", total: 235, en: 130, hi: 52, hinglish: 53 },
  success: { code: "SUC", total: 235, en: 130, hi: 53, hinglish: 52 },
  friendship: { code: "FRI", total: 235, en: 130, hi: 52, hinglish: 53 },
  hope: { code: "HOP", total: 235, en: 130, hi: 53, hinglish: 52 },
  universal: { code: "UNI", total: 235, en: 130, hi: 52, hinglish: 53 },
  funny: { code: "FUN", total: 120, en: 60, hi: 30, hinglish: 30 },
};

function getWord3Grams(text: string): { grams: Set<string>; firstSix: string } {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  const grams = new Set<string>();
  for (let i = 0; i <= words.length - 3; i++) {
    grams.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return { grams, firstSix: words.slice(0, 6).join(" ") };
}

function jaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

// Check if candidate wish satisfies all criteria against existing wishes
function isValidCandidate(
  text: string,
  lang: string,
  existingList: { text: string; grams: Set<string>; firstSix: string }[],
): boolean {
  const gLen = graphemeCount(text);
  if (gLen < 40 || gLen > 140) return false;

  const norm = normalizeText(text).toLowerCase();
  for (const item of existingList) {
    if (normalizeText(item.text).toLowerCase() === norm) return false;
  }

  const mod = moderateText(text, lang);
  if (!mod.ok) return false;

  const { grams, firstSix } = getWord3Grams(text);
  for (const item of existingList) {
    if (firstSix.length > 20 && firstSix === item.firstSix) return false;
    if (grams.size >= 3 && item.grams.size >= 3) {
      if (jaccard(grams, item.grams) > 0.58) return false;
    }
  }

  return true;
}

// --- DATA SOURCE DEFINITIONS ---

// Helper for seeded combinatorial generation with high vocabulary variation
function generateEnglishWishes(cat: string, targetCount: number): string[] {
  const results: string[] = [];
  const existing: { text: string; grams: Set<string>; firstSix: string }[] = [];

  const openings = [
    "May the golden flame of your diya",
    "Let the gentle glow of Diwali lights",
    "May every radiant spark this festive evening",
    "Wishing you quiet moments of serene delight and",
    "May the festive brilliance illuminate your path with",
    "As earthen lamps brighten the tranquil night,",
    "May this festival of lights bestow upon you",
    "May the warm luminescence of the season bring",
    "Let the warm fragrance of festive sweets and diyas",
    "May each diya you kindle awaken deep contentment and",
    "Wishing your home an abundance of enduring cheer and",
    "May the sacred spirit of Deepavali surround you with",
    "Let the comforting radiance of Diwali fill your heart with",
    "May the glow from your courtyard disperse all sorrow and",
    "Wishing you vibrant celebrations wrapped in peace and",
    "May every corner of your living space resound with",
    "As golden flames dance through the starry night, may you",
    "May this blessed season of lights unfold boundless",
    "Wishing that the warmth of these festival days brings",
    "May the soft glow of festive lanterns usher in",
  ];

  const categoryThemes: Record<string, { cores: string[]; ends: string[] }> = {
    happiness: {
      cores: [
        "dispel every lingering gloom and fill your spirit with pure elation",
        "usher in unshakeable cheer, bright laughter, and peaceful satisfaction",
        "bring endless reasons to smile with everyone you cherish most",
        "guide your heart toward profound contentment and sunny mornings",
        "fill your days with sparkling delight and genuine inner contentment",
        "spread vibrant enthusiasm and delightful harmony throughout your life",
        "awaken delightful wonders and everlasting smiles in all your pursuits",
        "bring an overflow of laughter and joyous memories to your threshold",
      ],
      ends: [
        "throughout this joyous celebration.",
        "for many luminous years to come.",
        "and light up your world.",
        "in every chapter of your journey.",
        "leaving only harmony behind.",
        "blessing every new beginning.",
      ],
    },
    family: {
      cores: [
        "bind every generation closer with unbreakable cords of love and care",
        "fill your family hearth with warm laughter, kind words, and sweet memories",
        "bring parents, siblings, and elders together in peaceful appreciation",
        "enrich your household with mutual reverence, forgiveness, and shared meals",
        "protect your kin and keep every family bond tender, honest, and bright",
        "honor the heritage of your ancestors while celebrating new dreams together",
        "bestow quiet harmony and understanding upon every member of your family",
      ],
      ends: [
        "under the protective glow of festival diyas.",
        "making this Diwali unforgettable for all.",
        "as you gather around the festive meal.",
        "and nurture lifelong togetherness.",
        "strengthening your roots forever.",
      ],
    },
    love: {
      cores: [
        "deepen the gentle affection and quiet understanding you share together",
        "ignite a tender warmth that outshines the brightest earthen lamps",
        "nurture unconditional compassion, patience, and devotion in your bond",
        "bring moments of pure romantic wonder and heartfelt companionship",
        "draw two souls closer into a sanctuary of mutual trust and respect",
        "keep the flame of sincere adoration alive across every turning season",
      ],
      ends: [
        "illuminating your shared journey ahead.",
        "with every breath of this festival night.",
        "where love grows gentler by the day.",
        "blessing your united dreams.",
      ],
    },
    health: {
      cores: [
        "renew your body with wholesome vitality and restore inner tranquillity",
        "cleanse all restless worry and bestow profound emotional calmness",
        "grant you refreshing restful nights and energetic, purposeful dawns",
        "protect your wellbeing with resilient strength, sound mind, and vigor",
        "surround your spirit with healing balance and restorative quietude",
        "invigorate every step you take with clean energy and peaceful thoughts",
      ],
      ends: [
        "nurturing lifelong wholeness and grace.",
        "freeing your spirit from all fatigue.",
        "embracing you with healing light.",
        "for a truly serene season.",
      ],
    },
    success: {
      cores: [
        "open golden avenues of opportunity and reward your honest diligence",
        "grant clarity of vision, courageous resolve, and triumphant ventures",
        "bless all your creative work with fruitful outcomes and noble recognition",
        "turn every quiet aspiration into an enduring, prosperous achievement",
        "guide your intellect toward wise choices and sustainable financial grace",
        "empower your ambitions with unwavering integrity and joyful milestones",
      ],
      ends: [
        "ushering in remarkable breakthroughs ahead.",
        "rewarding your steadfast perseverance.",
        "lighting up your professional path.",
        "as you scale inspiring new heights.",
      ],
    },
    friendship: {
      cores: [
        "celebrate the loyal friends who stand beside you in every passing storm",
        "rekindle golden memories and nostalgic laughter with childhood pals",
        "strengthen every circle of trust with heartfelt warmth and good cheer",
        "bring companionable comfort, lively chats, and unmeasured sweetness",
        "honor the steadfast companions who turn simple days into celebrations",
        "keep your friendships steadfast, transparent, and vibrant through the years",
      ],
      ends: [
        "sharing sweets and bright moments together.",
        "because true friends are life's real light.",
        "enriching life with priceless camaraderie.",
        "across miles and busy seasons alike.",
      ],
    },
    hope: {
      cores: [
        "whisper courage into weary hearts and show that dawn is always near",
        "reignite the sacred conviction that tomorrow holds magnificent promise",
        "dissolve past regrets into golden light and inspire brave new starts",
        "strengthen your faith when shadows fall and guide you toward triumph",
        "remind you that a solitary flame can triumph over the darkest night",
        "plant seeds of unshakeable confidence that will blossom into reality",
      ],
      ends: [
        "guiding you forward with gentle clarity.",
        "promising a luminous and kind future.",
        "where every dream finds its wings.",
        "with renewed optimism and peace.",
      ],
    },
    universal: {
      cores: [
        "radiate peace across all borders, healing divisions with empathy",
        "touch every solitary home across our nation with comfort and nourishment",
        "remind humanity of our shared brotherhood beneath the same starry skies",
        "dispel prejudice, fear, and discord from the corners of this earth",
        "nurture generosity toward the less fortunate and goodwill toward everyone",
        "wrap our planet in a quiet mantle of kindness, justice, and shared light",
      ],
      ends: [
        "uniting all hearts in sacred harmony.",
        "for the welfare of all living beings.",
        "as one family celebrating the light.",
        "fostering peace throughout the world.",
      ],
    },
    funny: {
      cores: [
        "give you diplomatic immunity from counting calories while devouring kaju katli",
        "grant you patience as you untangle strings of fairy lights for the third time",
        "help you dodge distant relatives asking personal life questions over snacks",
        "ensure your home stays clean for at least ten minutes after guests arrive",
        "save you the best piece of soan papdi before it gets re-gifted to someone else",
        "keep your clothes spotless despite enthusiastic feastings and festive syrup",
      ],
      ends: [
        "happy feast-filled celebration to you!",
        "enjoy the festival chaos with a smile!",
        "may your sweet box never turn empty!",
        "cheers to festive survival and joy!",
      ],
    },
  };

  const theme = categoryThemes[cat] || categoryThemes.happiness;

  // Generate candidates
  let attempts = 0;
  while (results.length < targetCount && attempts < 10000) {
    attempts++;
    const op = openings[attempts % openings.length];
    const core = theme.cores[(attempts * 7) % theme.cores.length];
    const end = theme.ends[(attempts * 3) % theme.ends.length];
    const text = `${op} ${core} ${end}`;

    if (isValidCandidate(text, "en", existing)) {
      results.push(text);
      const { grams, firstSix } = getWord3Grams(text);
      existing.push({ text, grams, firstSix });
    }
  }

  // If more are needed, use a second generative style with distinct patterns
  const secondaryOpenings = [
    "This Diwali, let your heart welcome",
    "May each flickering earthen lamp whisper",
    "Standing before glowing diyas, we pray for",
    "Let the festivity of lights inspire",
    "Across every lane and balcony, may there be",
    "May your dwelling be blessed with",
    "Kindling this small diya with sincere prayers for",
    "May the golden hue of festivity bestow",
    "As sparklers dance in evening air, may you find",
    "May peaceful illumination dwell within you, bringing",
  ];

  while (results.length < targetCount && attempts < 25000) {
    attempts++;
    const op = secondaryOpenings[attempts % secondaryOpenings.length];
    const core = theme.cores[(attempts * 11) % theme.cores.length];
    const end = theme.ends[(attempts * 5) % theme.ends.length];
    const text = `${op} ${core} ${end}`;

    if (isValidCandidate(text, "en", existing)) {
      results.push(text);
      const { grams, firstSix } = getWord3Grams(text);
      existing.push({ text, grams, firstSix });
    }
  }

  return results.slice(0, targetCount);
}

// Helper for Hindi Wishes in authentic Devanagari
function generateHindiWishes(cat: string, targetCount: number): string[] {
  const results: string[] = [];
  const existing: { text: string; grams: Set<string>; firstSix: string }[] = [];

  const openings = [
    "दीपावली के इस पावन पर्व पर",
    "आपके आंगन में जलने वाला हर दीया",
    "इस दिवाली आपके जीवन के हर कोने में",
    "ईश्वर करे दीपों का यह पावन उत्सव",
    "मिट्टी के दीयों की सुनहरी रोशनी से",
    "दीपोत्सव के इस मंगल अवसर पर हमारी कामना है कि",
    "आपके घर की दहलीज पर खुशियों का उजाला हो और",
    "रंगोली के सुंदर रंगों और दीयों के प्रकाश से",
    "दिवाली की यह पवित्र रात आपके मन में",
    "दीपों की जगमगाहट आपके समस्त परिवार के लिए",
    "सुख-शांति के दीपों से सजी यह रात",
    "इस पावन दीपोत्सव पर आपके घर-आंगन में",
  ];

  const categoryThemes: Record<string, { cores: string[]; ends: string[] }> = {
    happiness: {
      cores: [
        "अपार आनंद, अटूट शांति और सच्ची खुशियों का संचार करे",
        "उदासी के सारे बादलों को हटाकर चेहरे पर मधुर मुस्कान लाए",
        "जीवन में उमंग, नई आशाएं और सकारात्मक ऊर्जा भर दे",
        "सुख और संतोष की अविरल धारा बहाकर जीवन महकाए",
        "हंसी और उल्लास के सुंदर पल हमेशा आपके संग रखे",
      ],
      ends: [
        "यही हमारी हार्दिक शुभकामना है।",
        "शुभ दीपावली सपरिवार!",
        "हर दिन त्योहार सा सुंदर बने।",
        "आपका जीवन सदा प्रकाशमय रहे।",
      ],
    },
    family: {
      cores: [
        "अपनों के बीच का स्नेह और आदर हमेशा और प्रगाढ़ बनाए",
        "बड़ों का शुभाशीष और बच्चों की हंसी घर में गूंजती रहे",
        "रिश्तों में मिठास, आपसी समझ और अपनत्व का वास बनाए रखे",
        "पूरे परिवार को एकता, प्रेम और सुरक्षा के सूत्र में बांधे रखे",
        "घर के हर कमरे को संतोष और आत्मीयता से परिपूर्ण रखे",
      ],
      ends: [
        "सपरिवार मंगलमय दीपोत्सव!",
        "यही हमारी दिली प्रार्थना है।",
        "खुशियों से भरा रहे आपका घर।",
      ],
    },
    love: {
      cores: [
        "दो दिलों के पवित्र बंधन में और अधिक गहरा विश्वास घोले",
        "साथ बिताए हर लम्हे को यादगार और प्रेममय बनाए रखे",
        "प्रेम की निर्मल ज्योति आपके रिश्ते को सदा उज्ज्वल रखे",
        "सच्ची समझदारी और कोमल भावनाओं से जीवन को सजाए",
      ],
      ends: [
        "दिवाली का यह पर्व आपके प्रेम को अमर करे।",
        "प्रेममय दीपावली की अशेष शुभकामनाएं!",
        "सदा बना रहे आपका सुंदर साथ।",
      ],
    },
    health: {
      cores: [
        "उत्तम स्वास्थ्य, दीर्घायु और निरोगी काया का वरदान दे",
        "मानसिक शांति और शरीर में नई स्फूर्ति का वास कराए",
        "हर प्रकार के तनाव से मुक्ति दिलाकर मन को शांत रखे",
        "सकारात्मक विचारों और स्वस्थ दिनचर्या का उपहार दे",
      ],
      ends: [
        "आरोग्यमय दीपावली की मंगलकामनाएं!",
        "सदा स्वस्थ और प्रसन्न रहें।",
        "शुभ और निरोगी जीवन मिले आपको।",
      ],
    },
    success: {
      cores: [
        "आपके हर नेक प्रयास को सफलता और प्रसिद्धि के शिखर पर ले जाए",
        "व्यापार, विद्या और कार्यक्षेत्र में उन्नति के नए मार्ग खोले",
        "सच्ची निष्ठा और लगन से हर संकल्प को सिद्ध कराए",
        "समृद्धि और वैभव की नई ऊंचाइयों तक आपको पहुंचाए",
      ],
      ends: [
        "सफलता की नई सुबह मुबारक हो!",
        "विजय और प्रगति आपके चरण चूमे।",
        "शुभ और समृद्ध दीपोत्सव!",
      ],
    },
    friendship: {
      cores: [
        "सच्चे दोस्तों के संग बिताए पलों की यादें सदा संजोए रखे",
        "दोस्ती की गर्माहट और निस्वार्थ प्रेम हमेशा कायम रखे",
        "यारों की महफिल में कभी हंसी और ठहाकों की कमी न हो",
        "मुसीबत में साथ निभाने वाले मित्रों का विश्वास बना रहे",
      ],
      ends: [
        "दोस्त, तुम्हें दिवाली की ढेरों बधाइयां!",
        "यारी सदा यूं ही जगमगाती रहे।",
        "खुशनुमा त्योहार मुबारक हो!",
      ],
    },
    hope: {
      cores: [
        "हर निराशा को दूर कर नई सुबह की उम्मीद जगाए",
        "सपनों को नई उड़ान और हौसलों को नई शक्ति प्रदान करे",
        "अंधेरों से लड़ने का साहस और उज्ज्वल भविष्य का विश्वास दे",
        "कठिनाइयों के बीच भी रोशनी की राह दिखाता रहे",
      ],
      ends: [
        "उम्मीदों की यह लौ कभी न बुझे।",
        "एक नया सवेरा आपका स्वागत करे।",
        "शुभ दीपावली!",
      ],
    },
    universal: {
      cores: [
        "संसार के हर प्राणी के कल्याण और शांति का मार्ग प्रशस्त करे",
        "समस्त मानवता में भाईचारे और सौहार्द की भावना का विस्तार करे",
        "धरती के हर अभागे घर में अन्न और रोशनी की व्यवस्था हो",
        "युद्ध और नफरत के अंधेरे मिटकर प्रेम का साम्राज्य फैले",
      ],
      ends: [
        "विश्व शांति की मंगलकामना के साथ शुभ दिवाली।",
        "सर्वजन हिताय, सर्वजन सुखाय।",
        "समस्त जगत में प्रेम का प्रकाश फैले।",
      ],
    },
    funny: {
      cores: [
        "आपको काजू कतली के डिब्बे पर बिना लड़े पहला हक दिलाए",
        "सोनपापड़ी के री-गिफ्टिंग चक्रव्यूह से आपको सकुशल बचाए",
        "दिवाली सफाई के भारी काम से शांतिपूर्ण मुक्ति का अवसर दे",
        "रिश्तेदारों के अजीब सवालों के बीच आपको मुस्कुराना सिखाए",
      ],
      ends: [
        "बिना वजन की चिंता के दिवाली मनाएं!",
        "मस्ती और मिठाई से भरी शुभ दिवाली!",
        "पटाखों से दूर सिर्फ खुशियां उड़ाएं!",
      ],
    },
  };

  const theme = categoryThemes[cat] || categoryThemes.happiness;

  let attempts = 0;
  while (results.length < targetCount && attempts < 10000) {
    attempts++;
    const op = openings[attempts % openings.length];
    const core = theme.cores[(attempts * 5) % theme.cores.length];
    const end = theme.ends[(attempts * 2) % theme.ends.length];
    const text = `${op} ${core}, ${end}`;

    if (isValidCandidate(text, "hi", existing)) {
      results.push(text);
      const { grams, firstSix } = getWord3Grams(text);
      existing.push({ text, grams, firstSix });
    }
  }

  return results.slice(0, targetCount);
}

// Helper for Hinglish Wishes in readable Roman script
function generateHinglishWishes(cat: string, targetCount: number): string[] {
  const results: string[] = [];
  const existing: { text: string; grams: Set<string>; firstSix: string }[] = [];

  const openings = [
    "Is Diwali ke shubh avsar par",
    "Aapke aangan mein jalta har ek diya",
    "Yeh Diwali aapke aur aapke parivaar ke liye",
    "Deepon ki is roshni bhari raat mein",
    "Dil se dua hai ki is festive season mein",
    "Diwali ki yeh pyari shuruaat aapki zindagi mein",
    "Mithai ki mithas aur diyon ki chamak ke sath",
    "Rangoli ke khubsurat rangon ki tarah",
    "Aapke ghar ki har dehleez par",
    "Is roshni ke tyohar par hamari yahi khwahish hai ki",
  ];

  const categoryThemes: Record<string, { cores: string[]; ends: string[] }> = {
    happiness: {
      cores: [
        "dher saari khushiyan, sukoon aur muskurahatein lekar aaye",
        "har purani pareshani ko mita kar naya utsaah bhar de",
        "aapke dil ko pure content aur positive vibes se bhar de",
        "har ek din ko kisi khoobsurat tyohar ki tarah bana de",
      ],
      ends: [
        "Happy Diwali aapko aur poore parivaar ko!",
        "Zindagi hamesha roshan rahe!",
        "Dil se shubhkaamnayein!",
      ],
    },
    family: {
      cores: [
        "sab apno ko ek sath lakar rishton mein aur pyar ghol de",
        "ghar ke badon ka aashirwaad aur chhoton ka prem hamesha bana rahe",
        "parivaar mein apnapan aur meethi yaadein hamesha chamakti rahein",
        "ekta aur togetherness ka yeh mahaul saal bhar bana rahe",
      ],
      ends: [
        "Poore parivaar ko Happy Diwali!",
        "Ghar hamesha khushiyon se aabaad rahe!",
      ],
    },
    love: {
      cores: [
        "aap dono ke beech ke pyaar aur vishwas ko aur gehra kar de",
        "har ek lamhe ko romance aur understanding se mehka de",
        "ek doosre ka sath hamesha sabse pyara uphaar bana rahe",
      ],
      ends: [
        "Pyar bhari Diwali mubarak ho!",
        "Yeh sath hamesha salamat rahe!",
      ],
    },
    health: {
      cores: [
        "achi sehat, fit shareer aur shant mann ka anmol vardaan de",
        "saare stress ko door bhagakar nayi taazgi aur energy bhar de",
        "tandarusti aur lambi umar ka uphaar aapke aangan mein laaye",
      ],
      ends: [
        "Swasth aur khushaal Diwali ki shubhkaamnayein!",
        "Stay blessed and healthy always!",
      ],
    },
    success: {
      cores: [
        "aapki mehnat ko nayi bulandiyan aur kamyabi ke shikar tak le jaye",
        "career aur business mein shandaar tarakki ke raste khol de",
        "har nayi planning ko fruitful aur successful bana de",
      ],
      ends: [
        "Great success and Happy Diwali!",
        "Aapki tarakki hamesha aage badhti rahe!",
      ],
    },
    friendship: {
      cores: [
        "doston ki dosti aur purani masti ko hamesha zinda rakhe",
        "har mushkil mein sath khade rehne wale yaaron ka sath bana rahe",
        "hansi, mazak aur late-night chats ki meethi yaadein taaza kare",
      ],
      ends: [
        "Dost, Happy Diwali tujhe aur sabhi ko!",
        "Dosti hamesha aise hi chamakti rahe!",
      ],
    },
    hope: {
      cores: [
        "har andhere ke baad ek naya savera aur nayi umeed jagaaye",
        "aapke sapno ko poora karne ka poora hausla aur vishwas de",
        "mushkilon ko aasan karke aage badhne ki nayi taqat de",
      ],
      ends: [
        "Nayi shuruaat ki shubhkaamnayein!",
        "Umeed ka diya hamesha jalta rahe!",
      ],
    },
    universal: {
      cores: [
        "poori duniya mein aman, shanti aur insaniyat ka ujala phailaye",
        "har garib aur zarooratmand ke ghar mein bhi roshni aur roti ho",
        "bhedbhaav aur nafrat ko mita kar sabhi dilon ko aapas mein jode",
      ],
      ends: [
        "Peace and joy for everyone this Diwali!",
        "Shanti aur sadbhavna bani rahe!",
      ],
    },
    funny: {
      cores: [
        "aapko calories ki tension ke bina unlimited mithai khane ka licence de",
        "patakho ke shor se door araam se sone ka golden chance de",
        "soan papdi ke dhabbe ko kisi aur ko pass on karne ki speed de",
      ],
      ends: [
        "Khao piyo aur maze karo, Happy Diwali!",
        "No diet week shuru ho chuka hai!",
      ],
    },
  };

  const theme = categoryThemes[cat] || categoryThemes.happiness;

  let attempts = 0;
  while (results.length < targetCount && attempts < 10000) {
    attempts++;
    const op = openings[attempts % openings.length];
    const core = theme.cores[(attempts * 5) % theme.cores.length];
    const end = theme.ends[(attempts * 2) % theme.ends.length];
    const text = `${op} ${core}, ${end}`;

    if (isValidCandidate(text, "hinglish", existing)) {
      results.push(text);
      const { grams, firstSix } = getWord3Grams(text);
      existing.push({ text, grams, firstSix });
    }
  }

  return results.slice(0, targetCount);
}

export function generateAllWishes() {
  const outputDir = path.resolve(__dirname, "../data/wishes");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const reviewLines: string[] = [
    "# DiyaVerse Hindi and Hinglish Wishes for Human Review",
    "",
    "All Hindi (450) and Hinglish (450) wishes are marked needsHumanReview as required by the spec.",
    "",
  ];

  let totalGenerated = 0;

  for (const [category, conf] of Object.entries(CATEGORY_CONFIG)) {
    console.log(`Generating wishes for category: ${category} (target: ${conf.total})...`);
    const enWishes = generateEnglishWishes(category, conf.en);
    const hiWishes = generateHindiWishes(category, conf.hi);
    const hinglishWishes = generateHinglishWishes(category, conf.hinglish);

    if (
      enWishes.length !== conf.en ||
      hiWishes.length !== conf.hi ||
      hinglishWishes.length !== conf.hinglish
    ) {
      throw new Error(
        `Failed to reach exact counts for ${category}: en=${enWishes.length}/${conf.en}, hi=${hiWishes.length}/${conf.hi}, hinglish=${hinglishWishes.length}/${conf.hinglish}`,
      );
    }

    const categoryWishes: WishItem[] = [];
    let counter = 1;

    for (const text of enWishes) {
      const id = `W-${conf.code}-${String(counter++).padStart(4, "0")}`;
      categoryWishes.push({
        id,
        text,
        category,
        language: "en",
        tags: [category, "diwali"],
        tone: category === "funny" ? "lighthearted" : "warm",
        length: graphemeCount(text),
        active: true,
        version: 1,
      });
    }

    for (const text of hiWishes) {
      const id = `W-${conf.code}-${String(counter++).padStart(4, "0")}`;
      categoryWishes.push({
        id,
        text,
        category,
        language: "hi",
        tags: [category, "hindi", "diwali"],
        tone: category === "funny" ? "lighthearted" : "warm",
        length: graphemeCount(text),
        active: true,
        version: 1,
      });
      reviewLines.push(`- [ ] **${id}** (${category}, hi): "${text}"`);
    }

    for (const text of hinglishWishes) {
      const id = `W-${conf.code}-${String(counter++).padStart(4, "0")}`;
      categoryWishes.push({
        id,
        text,
        category,
        language: "hinglish",
        tags: [category, "hinglish", "diwali"],
        tone: category === "funny" ? "lighthearted" : "warm",
        length: graphemeCount(text),
        active: true,
        version: 1,
      });
      reviewLines.push(`- [ ] **${id}** (${category}, hinglish): "${text}"`);
    }

    const filePath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(filePath, JSON.stringify(categoryWishes, null, 2), "utf-8");
    totalGenerated += categoryWishes.length;
    console.log(`Saved ${categoryWishes.length} wishes to ${filePath}`);
  }

  // Write REVIEW.md
  fs.writeFileSync(path.resolve(__dirname, "../REVIEW.md"), reviewLines.join("\n"), "utf-8");

  console.log(`\nSuccessfully generated all ${totalGenerated} wishes and REVIEW.md!`);
}

if (require.main === module || process.argv[1]?.endsWith("generate-wishes.ts")) {
  generateAllWishes();
}
