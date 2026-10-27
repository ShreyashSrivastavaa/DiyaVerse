export interface IndiaStateInfo {
  id: string;
  name: string;
  hindiName: string;
  // Centroid as [longitude, latitude] for d3-geo
  centroid: [number, number];
}

export const INDIA_STATES: IndiaStateInfo[] = [
  { id: "AP", name: "Andhra Pradesh", hindiName: "आंध्र प्रदेश", centroid: [79.74, 15.91] },
  { id: "AR", name: "Arunachal Pradesh", hindiName: "अरुणाचल प्रदेश", centroid: [94.72, 28.21] },
  { id: "AS", name: "Assam", hindiName: "असम", centroid: [92.93, 26.2] },
  { id: "BR", name: "Bihar", hindiName: "बिहार", centroid: [85.31, 25.09] },
  { id: "CT", name: "Chhattisgarh", hindiName: "छत्तीसगढ़", centroid: [81.86, 21.27] },
  { id: "GA", name: "Goa", hindiName: "गोवा", centroid: [74.12, 15.29] },
  { id: "GJ", name: "Gujarat", hindiName: "गुजरात", centroid: [71.19, 22.25] },
  { id: "HR", name: "Haryana", hindiName: "हरियाणा", centroid: [76.08, 29.05] },
  { id: "HP", name: "Himachal Pradesh", hindiName: "हिमाचल प्रदेश", centroid: [77.17, 31.1] },
  { id: "JH", name: "Jharkhand", hindiName: "झारखंड", centroid: [85.27, 23.61] },
  { id: "KA", name: "Karnataka", hindiName: "कर्नाटक", centroid: [75.71, 15.31] },
  { id: "KL", name: "Kerala", hindiName: "केरल", centroid: [76.27, 10.85] },
  { id: "MP", name: "Madhya Pradesh", hindiName: "मध्य प्रदेश", centroid: [78.65, 22.97] },
  { id: "MH", name: "Maharashtra", hindiName: "महाराष्ट्र", centroid: [75.71, 19.75] },
  { id: "MN", name: "Manipur", hindiName: "मणिपुर", centroid: [93.9, 24.66] },
  { id: "ML", name: "Meghalaya", hindiName: "मेघालय", centroid: [91.36, 25.46] },
  { id: "MZ", name: "Mizoram", hindiName: "मिज़ोरम", centroid: [92.93, 23.16] },
  { id: "NL", name: "Nagaland", hindiName: "नागालैंड", centroid: [94.56, 26.15] },
  { id: "OR", name: "Odisha", hindiName: "ओडिशा", centroid: [84.41, 20.95] },
  { id: "PB", name: "Punjab", hindiName: "पंजाब", centroid: [75.34, 31.14] },
  { id: "RJ", name: "Rajasthan", hindiName: "राजस्थान", centroid: [74.21, 27.02] },
  { id: "SK", name: "Sikkim", hindiName: "सिक्किम", centroid: [88.51, 27.53] },
  { id: "TN", name: "Tamil Nadu", hindiName: "तमिलनाडु", centroid: [78.65, 11.12] },
  { id: "TG", name: "Telangana", hindiName: "तेलंगाना", centroid: [79.01, 18.11] },
  { id: "TR", name: "Tripura", hindiName: "त्रिपुरा", centroid: [91.98, 23.94] },
  { id: "UP", name: "Uttar Pradesh", hindiName: "उत्तर प्रदेश", centroid: [80.94, 26.84] },
  { id: "UT", name: "Uttarakhand", hindiName: "उत्तराखंड", centroid: [79.01, 30.06] },
  { id: "WB", name: "West Bengal", hindiName: "पश्चिम बंगाल", centroid: [87.85, 22.98] },
  // Union Territories
  { id: "AN", name: "Andaman and Nicobar Islands", hindiName: "अंडमान और निकोबार", centroid: [92.74, 11.74] },
  { id: "CH", name: "Chandigarh", hindiName: "चंडीगढ़", centroid: [76.77, 30.73] },
  { id: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", hindiName: "दादरा और नगर हवेली एवं दमन और दीव", centroid: [72.93, 20.42] },
  { id: "DL", name: "Delhi", hindiName: "दिल्ली (NCR)", centroid: [77.1, 28.7] },
  { id: "JK", name: "Jammu and Kashmir", hindiName: "जम्मू और कश्मीर", centroid: [74.79, 33.77] },
  { id: "LA", name: "Ladakh", hindiName: "लद्दाख", centroid: [77.57, 34.15] },
  { id: "LD", name: "Lakshadweep", hindiName: "लक्षद्वीप", centroid: [73.0, 10.56] },
  { id: "PY", name: "Puducherry", hindiName: "पुडुचेरी", centroid: [79.8, 11.94] },
];

/**
 * Finds state info by state name, id, or partial match
 */
export function findStateInfo(query?: string | null): IndiaStateInfo | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  return (
    INDIA_STATES.find(
      (s) =>
        s.id.toLowerCase() === q ||
        s.name.toLowerCase() === q ||
        s.hindiName === query.trim() ||
        s.name.toLowerCase().includes(q) ||
        q.includes(s.name.toLowerCase())
    ) || null
  );
}

/**
 * Hash string or number to a deterministic 32-bit integer
 */
export function hashToSeed(val: string | number): number {
  if (typeof val === "number") return val;
  let hash = 0;
  for (let i = 0; i < val.length; i++) {
    hash = (hash << 5) - hash + val.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Deterministic pseudo-random number generator in [0, 1) based on seed
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Standard populated points across India for legacy diyas without location
 * Spread across North, South, East, West, Central, North-East regions of India
 */
export const INDIA_POPULATION_HUBS: [number, number][] = [
  [77.209, 28.613], // New Delhi / NCR
  [72.877, 19.076], // Mumbai
  [77.594, 12.971], // Bengaluru
  [88.363, 22.572], // Kolkata
  [80.270, 13.082], // Chennai
  [78.486, 17.385], // Hyderabad
  [72.571, 23.022], // Ahmedabad
  [73.856, 18.520], // Pune
  [75.787, 26.912], // Jaipur
  [80.946, 26.846], // Lucknow
  [85.137, 25.594], // Patna
  [75.857, 22.719], // Indore
  [77.412, 23.259], // Bhopal
  [76.779, 30.733], // Chandigarh
  [85.824, 20.296], // Bhubaneswar
  [91.736, 26.144], // Guwahati
  [82.973, 25.317], // Varanasi
  [81.629, 21.251], // Raipur
  [76.955, 11.016], // Coimbatore
  [76.267, 9.931],  // Kochi
  [74.872, 31.634], // Amritsar
  [78.008, 27.176], // Agra
  [73.024, 26.238], // Jodhpur
  [79.088, 21.145], // Nagpur
  [70.802, 22.303], // Rajkot
  [86.202, 22.804], // Jamshedpur
  [83.218, 17.686], // Visakhapatnam
  [77.032, 28.459], // Gurugram
  [77.391, 28.535], // Noida
  [78.119, 9.925],  // Madurai
  [81.846, 25.435], // Prayagraj
  [74.797, 34.083], // Srinagar
  [78.032, 30.316], // Dehradun
  [93.936, 24.817], // Imphal
  [88.613, 27.331], // Gangtok
  [91.893, 25.578], // Shillong
];
