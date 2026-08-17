/**
 * Comprehensive Country Flag Resolver.
 * Direct ISO code mappings with FlagCDN and PureCat CDN fallbacks.
 */

const COUNTRY_MAP: Record<string, string> = {
  // UK & Home Nations
  england: "gb-eng",
  "great britain": "gb",
  uk: "gb",
  "united kingdom": "gb",
  scotland: "gb-sct",
  wales: "gb-wls",
  "northern ireland": "gb-nir",

  // Western & Southern Europe
  spain: "es",
  germany: "de",
  italy: "it",
  france: "fr",
  portugal: "pt",
  netherlands: "nl",
  belgium: "be",
  switzerland: "ch",
  austria: "at",
  greece: "gr",
  cyprus: "cy",
  malta: "mt",
  andorra: "ad",
  monaco: "mc",
  sanmarino: "sm",
  "san marino": "sm",
  gibraltar: "gi",
  ireland: "ie",
  "republic of ireland": "ie",

  // Northern Europe / Scandinavia
  denmark: "dk",
  sweden: "se",
  norway: "no",
  finland: "fi",
  iceland: "is",
  faroe: "fo",
  "faroe islands": "fo",

  // Eastern & Central Europe
  croatia: "hr",
  poland: "pl",
  "czech republic": "cz",
  czechia: "cz",
  turkey: "tr",
  serbia: "rs",
  ukraine: "ua",
  romania: "ro",
  hungary: "hu",
  slovakia: "sk",
  slovenia: "si",
  russia: "ru",
  bulgaria: "bg",
  estonia: "ee",
  latvia: "lv",
  lithuania: "lt",
  georgia: "ge",
  armenia: "am",
  azerbaijan: "az",
  kazakhstan: "kz",
  albania: "al",
  bosnia: "ba",
  "bosnia and herzegovina": "ba",
  "north macedonia": "mk",
  macedonia: "mk",
  montenegro: "me",
  kosovo: "xk",
  moldova: "md",
  belarus: "by",
  luxembourg: "lu",
  liechtenstein: "li",

  // South America (CONMEBOL)
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
  guyana: "gy",
  suriname: "sr",

  // North & Central America (CONCACAF)
  "united states": "us",
  usa: "us",
  mexico: "mx",
  canada: "ca",
  jamaica: "jm",
  "costa rica": "cr",
  panama: "pa",
  honduras: "hn",
  "el salvador": "sv",
  guatemala: "gt",
  nicaragua: "ni",
  haiti: "ht",
  "trinidad and tobago": "tt",
  trinidad: "tt",
  cuba: "cu",
  curacao: "cw",
  "dominican republic": "do",

  // Africa (CAF)
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
  "dr congo": "cd",
  "congo dr": "cd",
  angola: "ao",
  zambia: "zm",
  zimbabwe: "zw",
  kenya: "ke",
  uganda: "ug",
  tanzania: "tz",
  ethiopia: "et",
  sudan: "sd",
  "cape verde": "cv",
  guinea: "gn",
  "guinea-bissau": "gw",
  "equatorial guinea": "gq",
  "burkina faso": "bf",
  gabon: "ga",
  benin: "bj",
  togo: "tg",
  namibia: "na",
  mozambique: "mz",
  madagascar: "mg",
  mauritania: "mr",
  rwanda: "rw",
  libya: "ly",

  // Asia & Middle East (AFC)
  "saudi arabia": "sa",
  japan: "jp",
  "south korea": "kr",
  korea: "kr",
  "korea republic": "kr",
  australia: "au",
  iran: "ir",
  qatar: "qa",
  uae: "ae",
  "united arab emirates": "ae",
  china: "cn",
  india: "in",
  iraq: "iq",
  uzbekistan: "uz",
  jordan: "jo",
  bahrain: "bh",
  oman: "om",
  kuwait: "kw",
  lebanon: "lb",
  syria: "sy",
  palestine: "ps",
  israel: "il",
  thailand: "th",
  vietnam: "vn",
  indonesia: "id",
  malaysia: "my",
  singapore: "sg",
  philippines: "ph",
  "new zealand": "nz",

  // Continents & International
  europe: "eu",
  world: "un",
  international: "un",
  worldwide: "un",
};

/**
 * Returns a high quality FlagCDN URL for a given country name or 2-letter ISO code.
 */
export function getCountryFlagUrl(countryName?: string | null, width = 40): string | null {
  if (!countryName) return null;
  const key = countryName.trim().toLowerCase();
  const code = COUNTRY_MAP[key] || (key.length === 2 ? key : null);
  if (!code) return null;
  return `https://flagcdn.com/w${width}/${code}.png`;
}

/**
 * Returns an array of fallback flag URLs for extra reliability.
 */
export function getCountryFlagSources(countryName?: string | null): string[] {
  if (!countryName) return [];
  const key = countryName.trim().toLowerCase();
  const code = COUNTRY_MAP[key] || (key.length === 2 ? key : null);
  if (!code) return [];

  const upper = code.toUpperCase();
  return [
    `https://flagcdn.com/w80/${code}.png`,
    `https://flagcdn.com/w40/${code}.png`,
    `https://purecatamphetamine.github.io/country-flag-icons/3x2/${upper}.svg`,
  ];
}
