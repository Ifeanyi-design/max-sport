/**
 * Direct HD Competition & League Logo Dictionary.
 * Maps competition slugs and names to their official high-res transparent badges.
 */

export const COMPETITION_LOGOS: Record<string, string> = {
  // Top Leagues
  "english-premier-league": "https://media.api-sports.io/football/leagues/39.png",
  "premier-league": "https://media.api-sports.io/football/leagues/39.png",
  "la-liga": "https://media.api-sports.io/football/leagues/140.png",
  bundesliga: "https://media.api-sports.io/football/leagues/78.png",
  "serie-a": "https://media.api-sports.io/football/leagues/135.png",
  "ligue-1": "https://media.api-sports.io/football/leagues/61.png",
  "uefa-champions-league": "https://media.api-sports.io/football/leagues/2.png",
  "champions-league": "https://media.api-sports.io/football/leagues/2.png",
  "uefa-europa-league": "https://media.api-sports.io/football/leagues/3.png",
  "europa-league": "https://media.api-sports.io/football/leagues/3.png",
  "uefa-conference-league": "https://media.api-sports.io/football/leagues/848.png",
  "uefa-super-cup": "https://media.api-sports.io/football/leagues/531.png",

  // Domestic Cups
  "fa-cup": "https://media.api-sports.io/football/leagues/45.png",
  "efl-cup": "https://media.api-sports.io/football/leagues/48.png",
  "carabao-cup": "https://media.api-sports.io/football/leagues/48.png",
  "copa-del-rey": "https://media.api-sports.io/football/leagues/143.png",
  "dfb-pokal": "https://media.api-sports.io/football/leagues/81.png",
  "coppa-italia": "https://media.api-sports.io/football/leagues/137.png",
  "coupe-de-france": "https://media.api-sports.io/football/leagues/66.png",

  // Other Major Leagues
  eredivisie: "https://media.api-sports.io/football/leagues/88.png",
  "primeira-liga": "https://media.api-sports.io/football/leagues/94.png",
  "scottish-premiership": "https://media.api-sports.io/football/leagues/179.png",
  "super-lig": "https://media.api-sports.io/football/leagues/203.png",
  "saudi-pro-league": "https://media.api-sports.io/football/leagues/307.png",
  mls: "https://media.api-sports.io/football/leagues/253.png",
  "major-league-soccer": "https://media.api-sports.io/football/leagues/253.png",
  brasileirao: "https://media.api-sports.io/football/leagues/71.png",
  "serie-a-brazil": "https://media.api-sports.io/football/leagues/71.png",
  "primera-division-argentina": "https://media.api-sports.io/football/leagues/128.png",
  "copa-libertadores": "https://media.api-sports.io/football/leagues/13.png",
  "copa-sudamericana": "https://media.api-sports.io/football/leagues/11.png",

  // International Tournaments
  "fifa-world-cup": "https://media.api-sports.io/football/leagues/1.png",
  "world-cup": "https://media.api-sports.io/football/leagues/1.png",
  "world-cup-2026": "https://media.api-sports.io/football/leagues/1.png",
  "uefa-euro": "https://media.api-sports.io/football/leagues/4.png",
  "copa-america": "https://media.api-sports.io/football/leagues/9.png",
  "africa-cup-of-nations": "https://media.api-sports.io/football/leagues/6.png",
  afcon: "https://media.api-sports.io/football/leagues/6.png",
  "uefa-nations-league": "https://media.api-sports.io/football/leagues/5.png",
};

export function getCompetitionDictionaryLogo(slugOrName?: string | null): string | null {
  if (!slugOrName) return null;
  const key = slugOrName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return COMPETITION_LOGOS[key] || COMPETITION_LOGOS[slugOrName.toLowerCase().trim()] || null;
}
