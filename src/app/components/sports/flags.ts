/**
 * Real SVG/PNG Flag resolver for football countries and leagues.
 * Uses FlagCDN (high quality, reliable, free SVG/PNG flag CDN).
 * NO generic emojis used.
 */

const COUNTRY_MAP: Record<string, string> = {
  // Home nations & UK
  england: "gb-eng",
  "great britain": "gb",
  uk: "gb",
  "united kingdom": "gb",
  scotland: "gb-sct",
  wales: "gb-wls",
  "northern ireland": "gb-nir",

  // Top European Football Nations
  spain: "es",
  germany: "de",
  italy: "it",
  france: "fr",
  portugal: "pt",
  netherlands: "nl",
  belgium: "be",
  croatia: "hr",
  switzerland: "ch",
  austria: "at",
  denmark: "dk",
  sweden: "se",
  norway: "no",
  finland: "fi",
  poland: "pl",
  "czech republic": "cz",
  czechia: "cz",
  greece: "gr",
  turkey: "tr",
  serbia: "rs",
  ukraine: "ua",
  romania: "ro",
  hungary: "hu",
  slovakia: "sk",
  slovenia: "si",
  ireland: "ie",
  "republic of ireland": "ie",
  russia: "ru",
  bulgaria: "bg",
  cyprus: "cy",
  estonia: "ee",
  latvia: "lv",
  lithuania: "lt",
  georgia: "ge",
  armenia: "am",
  azerbaijan: "az",
  kazakhstan: "kz",
  albania: "al",
  iceland: "is",
  luxembourg: "lu",
  malta: "mt",
  israel: "il",

  // South America
  brazil: "br",
  argentina: "ar",
  uruguay: "uy",
  colombia: "co",
  chile: "cl",
  peru: "pe",
  ecuador: "ec",
  paraguay: "py",
  venezuela: "ve",
  bolivia: "bo",

  // North & Central America
  "united states": "us",
  usa: "us",
  mexico: "mx",
  canada: "ca",
  jamaica: "jm",
  "costa rica": "cr",
  panama: "pa",
  honduras: "hn",

  // Africa
  nigeria: "ng",
  ghana: "gh",
  senegal: "sn",
  egypt: "eg",
  morocco: "ma",
  cameroon: "cm",
  "ivory coast": "ci",
  "côte d'ivoire": "ci",
  algeria: "dz",
  tunisia: "tn",
  "south africa": "za",
  mali: "ml",
  congo: "cg",
  drc: "cd",
  angola: "ao",
  zambia: "zm",

  // Asia & Middle East
  "saudi arabia": "sa",
  japan: "jp",
  "south korea": "kr",
  korea: "kr",
  australia: "au",
  iran: "ir",
  qatar: "qa",
  uae: "ae",
  "united arab emirates": "ae",
  china: "cn",
  india: "in",
  iraq: "iq",
  uzbekistan: "uz",

  // Continental
  europe: "eu",
  world: "un",
  international: "un",
};

/**
 * Returns a high quality FlagCDN URL for a given country name or 2-letter ISO code.
 * e.g. "England" -> "https://flagcdn.com/w40/gb-eng.png"
 *      "Spain"   -> "https://flagcdn.com/w40/es.png"
 */
export function getCountryFlagUrl(countryName?: string | null, width = 40): string | null {
  if (!countryName) return null;
  const key = countryName.trim().toLowerCase();
  const code = COUNTRY_MAP[key] || (key.length === 2 ? key : null);
  if (!code) return null;
  return `https://flagcdn.com/w${width}/${code}.png`;
}
