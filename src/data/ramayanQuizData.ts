export interface QuizQuestion {
  id: number;
  kanda: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question: string;
  questionHi: string;
  options: {
    id: "A" | "B" | "C" | "D";
    text: string;
    textHi: string;
  }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  explanationHi: string;
}

export const RAMAYAN_QUESTIONS: QuizQuestion[] = [
  // --- EASY (3 Questions) ---
  {
    id: 1,
    kanda: "Bala Kanda",
    difficulty: "Easy",
    question: "Who was the eldest son of King Dasharatha of Ayodhya, revered as the 7th avatar of Lord Vishnu?",
    questionHi: "अयोध्या के राजा दशरथ के सबसे ज्येष्ठ पुत्र कौन थे, जिन्हें भगवान विष्णु का 7वां अवतार माना जाता है?",
    options: [
      { id: "A", text: "Prince Bharata", textHi: "राजकुमार भरत" },
      { id: "B", text: "Shri Rama", textHi: "श्री राम" },
      { id: "C", text: "Prince Lakshmana", textHi: "राजकुमार लक्ष्मण" },
      { id: "D", text: "Prince Shatrughna", textHi: "राजकुमार शत्रुघ्न" },
    ],
    correctAnswer: "B",
    explanation: "Shri Rama was the eldest of Dasharatha's four sons, born to Queen Kaushalya on the auspicious day of Chaitra Navami.",
    explanationHi: "श्री राम राजा दशरथ के सबसे बड़े पुत्र थे, जिनका जन्म महारानी कौशल्या की कोख से चैत्र शुक्ल नवमी को हुआ था।",
  },
  {
    id: 2,
    kanda: "Ayodhya Kanda",
    difficulty: "Easy",
    question: "Which queen claimed two promised boons from King Dasharatha, leading to Lord Rama's 14-year exile and Bharata's coronation?",
    questionHi: "राजा दशरथ से दो वरदान मांगकर श्री राम को 14 वर्ष का वनवास और भरत को राज्याभिषेक किस रानी ने दिलवाया?",
    options: [
      { id: "A", text: "Queen Kaushalya", textHi: "रानी कौशल्या" },
      { id: "B", text: "Queen Sumitra", textHi: "रानी सुमित्रा" },
      { id: "C", text: "Queen Kaikeyi", textHi: "रानी कैकेयी" },
      { id: "D", text: "Queen Mandodari", textHi: "रानी मंदोदरी" },
    ],
    correctAnswer: "C",
    explanation: "Influenced by maid Manthara, Queen Kaikeyi asked for the two boons King Dasharatha had granted her during an ancient battle.",
    explanationHi: "मंथरा के बहकावे में आकर रानी कैकेयी ने राजा दशरथ द्वारा देवासुर संग्राम के समय दिए गए दो वरदानों की मांग की थी।",
  },
  {
    id: 3,
    kanda: "Sundara Kanda",
    difficulty: "Easy",
    question: "Who arrived in Ashoka Vatika in Lanka and presented Lord Rama's signet ring (Mudrika) to Mata Sita as proof of identity?",
    questionHi: "लंका के अशोक वाटिका में पहुंचकर माता सीता को श्री राम की मुद्रिका (अंगूठी) पहचान के रूप में किसने भेंट की थी?",
    options: [
      { id: "A", text: "Sugriva", textHi: "वानरराज सुग्रीव" },
      { id: "B", text: "Angada", textHi: "युवराज अंगद" },
      { id: "C", text: "Hanuman Ji", textHi: "पवनपुत्र हनुमान जी" },
      { id: "D", text: "Jambavan", textHi: "ऋक्षराज जाम्बवान" },
    ],
    correctAnswer: "C",
    explanation: "Pawanputra Hanuman leaped across the southern ocean, found Mata Sita in Ashoka Vatika, and respectfully placed Rama's divine ring before her.",
    explanationHi: "पवनपुत्र हनुमान जी ने विशाल समुद्र लांघकर लंका के अशोक वाटिका में माता सीता को श्री राम की दिव्य मुद्रिका भेंट की थी।",
  },

  // --- MEDIUM (3 Questions) ---
  {
    id: 4,
    kanda: "Bala Kanda",
    difficulty: "Medium",
    question: "At Mata Sita's Swayamvara in Janakpur (Mithila), which sacred divine bow of Lord Shiva did Shri Rama string and break?",
    questionHi: "मिथिला (जनकपुर) में माता सीता के स्वयंवर में श्री राम ने भगवान शिव के किस दिव्य धनुष पर प्रत्यंचा चढ़ाकर उसे तोड़ा था?",
    options: [
      { id: "A", text: "Gandiva Bow", textHi: "गांडीव धनुष" },
      { id: "B", text: "Pinaka Bow", textHi: "पिनाक धनुष" },
      { id: "C", text: "Sharanga Bow", textHi: "शारंग धनुष" },
      { id: "D", text: "Vijaya Bow", textHi: "विजय धनुष" },
    ],
    correctAnswer: "B",
    explanation: "The mighty bow of Lord Shiva kept in King Janaka's court was 'Pinaka'. Shri Rama lifted it effortlessly and strung it with supreme grace.",
    explanationHi: "राजा जनक के दरबार में रखा गया भगवान शिव का त्रिशूल-समान महाधनुष 'पिनाक' था, जिसे श्री राम ने सहजता से उठाया था।",
  },
  {
    id: 5,
    kanda: "Aranya Kanda",
    difficulty: "Medium",
    question: "In Panchavati during exile, whose nose and ears were severed by Lakshmana when she aggressively lunged towards Mata Sita?",
    questionHi: "पंचवटी में वनवास के दौरान माता सीता पर आक्रमण करने का प्रयास करने पर लक्ष्मण जी ने किस राक्षसी की नाक और कान काट दिए थे?",
    options: [
      { id: "A", text: "Tataka", textHi: "ताड़का" },
      { id: "B", text: "Surpanakha", textHi: "शूर्पणखा" },
      { id: "C", text: "Trijata", textHi: "त्रिजटा" },
      { id: "D", text: "Simhika", textHi: "सिंहिका" },
    ],
    correctAnswer: "B",
    explanation: "Ravana's sister Surpanakha disguised herself to tempt Rama and Lakshmana; when rejected, she attacked Sita and was punished by Lakshmana.",
    explanationHi: "रावण की बहन शूर्पणखा ने रूप बदलकर छल करने का प्रयास किया और माता सीता पर झपटने पर लक्ष्मण जी ने उसके नाक-कान काट दिए।",
  },
  {
    id: 6,
    kanda: "Kishkindha Kanda",
    difficulty: "Medium",
    question: "On which sacred mountain did the divine friendship and alliance between Sugriva and Shri Rama take place via Hanuman Ji?",
    questionHi: "सुग्रीव और श्री राम की ऐतिहासिक मित्रता और गठबंधन हनुमान जी के माध्यम से किस पवित्र पर्वत पर हुआ था?",
    options: [
      { id: "A", text: "Rishyamukha Parvat", textHi: "ऋष्यमूक पर्वत" },
      { id: "B", text: "Gandhamadana Parvat", textHi: "गंधमादन पर्वत" },
      { id: "C", text: "Dronagiri Parvat", textHi: "द्रोणागिरि पर्वत" },
      { id: "D", text: "Mainaka Parvat", textHi: "मैनाक पर्वत" },
    ],
    correctAnswer: "A",
    explanation: "Sage Matanga had cursed Vali never to step foot on Mount Rishyamukha. Sugriva lived there safely and met Shri Rama through Hanuman.",
    explanationHi: "ऋषि मतंग के शाप के कारण बालि कभी ऋष्यमूक पर्वत पर नहीं आ सकता था। इसी सुरक्षित स्थान पर श्री राम और सुग्रीव की मित्रता हुई।",
  },

  // --- HARD (4 Questions) ---
  {
    id: 7,
    kanda: "Aranya Kanda",
    difficulty: "Hard",
    question: "Pakshiraj Jatayu, who valiantly fought Ravana to rescue Mata Sita, and his elder brother Sampati were sons of which celestial deity?",
    questionHi: "माता सीता की रक्षा हेतु रावण से अंतिम सांस तक युद्ध करने वाले पक्षीराज जटायु और उनके बड़े भाई सम्पाती किस देवता के पुत्र थे?",
    options: [
      { id: "A", text: "Garuda", textHi: "गरुड़ देव" },
      { id: "B", text: "Aruna (Charioteer of Surya)", textHi: "अरुण (भगवान सूर्य के सारथी)" },
      { id: "C", text: "Vayu Dev", textHi: "पवनदेव वायु" },
      { id: "D", text: "Lord Varuna", textHi: "वरुण देव" },
    ],
    correctAnswer: "B",
    explanation: "Jatayu and Sampati were born to Aruna (the dawn charioteer of the Sun God Surya) and his wife Shyeni.",
    explanationHi: "पक्षीराज जटायु और सम्पाती भगवान सूर्य के सारथी अरुण और श्येनी के दिव्य पुत्र थे।",
  },
  {
    id: 8,
    kanda: "Yuddha Kanda",
    difficulty: "Hard",
    question: "Who were the twin Vanara divine architects gifted by Vishwakarma who designed and led the construction of the sacred Ram Setu?",
    questionHi: "श्री राम की सेना में भगवान विश्वकर्मा के आशीर्वाद प्राप्त वे दो वानर शिल्पी कौन थे, जिन्होंने समुद्र पर राम सेतु का निर्माण किया?",
    options: [
      { id: "A", text: "Nala and Nila", textHi: "नल और नील" },
      { id: "B", text: "Mainda and Dvivida", textHi: "मैंद और द्विविद" },
      { id: "C", text: "Angada and Sushena", textHi: "अंगद और सुषेण" },
      { id: "D", text: "Tara and Jambavan", textHi: "तार और जाम्बवान" },
    ],
    correctAnswer: "A",
    explanation: "Nala (the son of Vishwakarma) and his brother Nila possessed the divine architectural mastery to construct the floating bridge to Lanka in just 5 days.",
    explanationHi: "नल (विश्वकर्मा के अंशावतार) और नील के दिव्य स्पर्श और वास्तु कौशल से पत्थरों पर 'श्री राम' लिखकर समुद्र पर 5 दिनों में सेतु निर्मित हुआ।",
  },
  {
    id: 9,
    kanda: "Yuddha Kanda",
    difficulty: "Hard",
    question: "With which lethal celestial weapon did Meghanada (Indrajit) mortally wound Lakshmana, prompting Vaidya Sushena to prescribe the Sanjeevani herb?",
    questionHi: "युद्ध में मेघनाद (इंद्रजीत) द्वारा चलाए गए किस घातक अस्त्र से लक्ष्मण जी मूर्छित हुए थे, जिसके बाद वैद्य सुषेण ने संजीवनी बूटी मंगवाई?",
    options: [
      { id: "A", text: "Brahmashira Astra", textHi: "ब्रह्मशिरा अस्त्र" },
      { id: "B", text: "Veeraghatini Shakti", textHi: "वीरघातिनी शक्ति" },
      { id: "C", text: "Pashupatastra", textHi: "पाशुपतास्त्र" },
      { id: "D", text: "Narayanastra", textHi: "नारायणास्त्र" },
    ],
    correctAnswer: "B",
    explanation: "Indrajit unleashed the deadly 'Veeraghatini Shakti' upon Lakshmana. Only the Sanjeevani herb brought by Hanuman from Mount Dronagiri could revive him.",
    explanationHi: "मेघनाद ने लक्ष्मण जी पर ब्रह्मा द्वारा प्रदत्त 'वीरघातिनी शक्ति' चलाई थी। इसके उपचार हेतु हनुमान जी द्रोणागिरि से संजीवनी बूटी लाए थे।",
  },
  {
    id: 10,
    kanda: "Yuddha Kanda",
    difficulty: "Hard",
    question: "After victory over Ravana, on which mind-guided divine flying chariot did Shri Rama, Mata Sita, and companions return to Ayodhya for Diwali?",
    questionHi: "लंका विजय के पश्चात श्री राम, माता सीता और समस्त साथियों के साथ 14 वर्ष पूर्ण होने पर किस मन की गति से उड़ने वाले दिव्य विमान से अयोध्या लौटे थे?",
    options: [
      { id: "A", text: "Garuda Viman", textHi: "गरुड़ विमान" },
      { id: "B", text: "Pushpaka Viman", textHi: "पुष्पक विमान" },
      { id: "C", text: "Surya Rath", textHi: "सूर्य रथ" },
      { id: "D", text: "Indra Viman", textHi: "इंद्र विमान" },
    ],
    correctAnswer: "B",
    explanation: "The Pushpaka Vimana, originally crafted by Vishwakarma for Brahma and later acquired by Kubera, carried Shri Rama and his companions back to Ayodhya to inaugurate Diwali.",
    explanationHi: "पुष्पक विमान विश्वकर्मा द्वारा निर्मित मन की गति से चलने वाला दिव्य विमान था, जिस पर सवार होकर श्री राम अयोध्या लौटे और दीप जलाकर दीपावली मनाई गई।",
  },
];
