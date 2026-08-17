// Typed client for the MaxCinema Flask sports API (/api/sports).
// The API returns domain truth; cosmetic fields (league abbr/color/flag,
// team colors) are derived client-side so the UI keeps its look.

export interface ApiTeam {
  id: number;
  slug: string;
  name: string;
  short_name: string | null;
  abbr: string;
  logo_url: string | null;
  country?: string | null;
  provider_team_id?: string | null;
  provider_name?: string | null;
}

export interface ApiCompetition {
  id: number;
  slug: string;
  name: string;
  country: string | null;
  logo_url: string | null;
  current_season: string | null;
  featured: boolean;
  sport: string;
  provider_competition_id?: string | null;
  provider_name?: string | null;
}

export interface ApiMatch {
  id: number;
  slug: string;
  competition: ApiCompetition | null;
  league: string | null;
  home_team: ApiTeam | null;
  away_team: ApiTeam | null;
  home_score: number;
  away_score: number;
  status: string; // scheduled | live | finished
  provider_status: string | null;
  minute: number | null;
  kickoff_at: string | null;
  featured: boolean;
}

export interface ApiStanding {
  position: number;
  team: { name: string; slug: string | null; logo_url: string | null };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface ApiEvent {
  id?: number;
  team_slug: string | null;
  minute: number | null;
  clock: string | null;
  event_type: string;
  player_name: string | null;
  related_player_name: string | null;
  summary: string | null;
  sort_order: number;
}

export interface ApiStream {
  id: number;
  title: string;
  source_type: string;
  provider_name: string | null;
  embed_url: string | null;
  external_url: string | null;
  priority: number;
}

export interface ApiTeamStanding extends ApiStanding {
  competition: ApiCompetition;
}

export interface ApiTeamDetail {
  team: ApiTeam;
  recent_matches: ApiMatch[];
  upcoming_matches: ApiMatch[];
  standings: ApiTeamStanding[];
}

// --- API base -------------------------------------------------------------
const API_BASE: string =
  (import.meta as any).env?.VITE_API_BASE ?? "https://www.maxcinema.name.ng/api/sports";

async function fetchJson<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const url = new URL(API_BASE + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Sports API ${res.status}`);
  return (await res.json()) as T;
}

export function getCompetitions(): Promise<ApiCompetition[]> {
  return fetchJson<{ competitions: ApiCompetition[] }>("/competitions").then(
    (d) => d.competitions
  );
}

export function getLiveMatches(): Promise<ApiMatch[]> {
  return fetchJson<{ matches: ApiMatch[] }>("/live").then((d) => d.matches);
}

export function getMatches(opts: {
  competition?: string;
  status?: string;
  limit?: number;
} = {}): Promise<ApiMatch[]> {
  return fetchJson<{ matches: ApiMatch[] }>("/matches", opts).then((d) => d.matches);
}

export function getTeams(opts: { competition?: string; q?: string; limit?: number } = {}): Promise<ApiTeam[]> {
  return fetchJson<{ teams: ApiTeam[] }>("/teams", opts).then((d) => d.teams);
}

export function getTeam(slug: string): Promise<ApiTeamDetail> {
  return fetchJson<ApiTeamDetail>("/teams/" + slug);
}

export function getMatch(
  id: number
): Promise<{ match: ApiMatch; events: ApiEvent[]; streams: ApiStream[] }> {
  return fetchJson<{ match: ApiMatch; events: ApiEvent[]; streams: ApiStream[] }>(
    "/matches/" + id
  );
}

export function getStandings(slug: string): Promise<ApiStanding[]> {
  return fetchJson<{ competition: ApiCompetition; standings: ApiStanding[] }>(
    "/competitions/" + slug + "/standings"
  ).then((d) => d.standings);
}

export function getSportsMeta(): Promise<{ live_count: number; competitions: ApiCompetition[] }> {
  return fetchJson<{ live_count: number; competitions: ApiCompetition[] }>("/");
}

export interface ApiHighlight {
  id: number;
  title: string;
  competition: string | null;
  url?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  published_at?: string | null;
}

export function getHighlights(): Promise<ApiHighlight[]> {
  // The highlights endpoint is optional — returns empty array if not available.
  return fetchJson<{ highlights: ApiHighlight[] } | ApiHighlight[]>("/highlights")
    .then(d => Array.isArray(d) ? d : d.highlights ?? [])
    .catch(() => []);
}

// --- Cosmetic helpers ------------------------------------------------------
// League styling keyed by the API competition slug. Colors are accents only;
// crests come from logo_url.
export const LEAGUE_STYLES: Record<string, { abbr: string; color: string }> = {
  "english-premier-league": { abbr: "EPL", color: "#3d195b" },
  "uefa-champions-league": { abbr: "UCL", color: "#1a56db" },
  "la-liga": { abbr: "LL", color: "#c81e1e" },
  "serie-a": { abbr: "SA", color: "#0066b3" },
  "bundesliga": { abbr: "BUN", color: "#d20515" },
  "ligue-1": { abbr: "L1", color: "#0a7a3e" },
  "uefa-europa-league": { abbr: "UEL", color: "#c45c12" },
};

export function leagueStyle(slug?: string | null) {
  return LEAGUE_STYLES[slug ?? ""] ?? { abbr: "", color: "#6b6b7b" };
}

import { getClubDictionaryLogo } from "./clubLogos";
import { getCompetitionDictionaryLogo } from "./competitionLogos";

/** Build an ordered list of logo URLs to try for a team (first valid wins). */
export function teamLogoSources(team: { name?: string | null; logo_url?: string | null; provider_team_id?: string | null; provider_name?: string | null }): string[] {
  const sources: string[] = [];
  const dictLogo = getClubDictionaryLogo(team.name);
  if (dictLogo) sources.push(dictLogo);
  if (team.logo_url) sources.push(team.logo_url);
  if (team.provider_team_id && (!team.provider_name || team.provider_name === "api-football")) {
    sources.push(`https://media.api-sports.io/football/teams/${team.provider_team_id}.png`);
  }
  return sources;
}


/** Build an ordered list of logo URLs to try for a competition. */
export function competitionLogoSources(comp: { logo_url?: string | null; slug?: string | null; name?: string | null; provider_competition_id?: string | null; provider_name?: string | null }): string[] {
  const sources: string[] = [];
  const dictLogo = getCompetitionDictionaryLogo(comp.slug || comp.name);
  if (dictLogo) sources.push(dictLogo);
  if (comp.logo_url) sources.push(comp.logo_url);
  if (comp.provider_competition_id) {
    if (!comp.provider_name || comp.provider_name === "api-football") {
      sources.push(`https://media.api-sports.io/football/leagues/${comp.provider_competition_id}.png`);
    }
  }
  return sources;
}

// Deterministic hex color from a name (used for team badges).
export function colorFromString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  const r = (h >> 16) & 255;
  const g = (h >> 8) & 255;
  const b = h & 255;
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function abbrFromName(name: string, fallback = "TBD"): string {
  const t = (name || "").trim();
  if (!t) return fallback;
  const parts = t.split(/\s+/);
  if (parts.length === 1) return t.slice(0, 3).toUpperCase();
  return parts
    .map((p) => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

// --- Mappers to the shapes the UI components already render ----------------
export interface LiveCard {
  id: number;
  league: string;
  leagueAbbr: string;
  leagueColor: string;
  leagueLogo: string | null;
  leagueProviderId: string | null;
  leagueProviderName: string | null;
  phase: string;
  home: string;
  homeAbbr: string;
  homeColor: string;
  homeLogo: string | null;
  homeProviderId: string | null;
  homeProviderName: string | null;
  away: string;
  awayAbbr: string;
  awayColor: string;
  awayLogo: string | null;
  awayProviderId: string | null;
  awayProviderName: string | null;
  homeScore: number;
  awayScore: number;
  minute: string;
  hot: boolean;
  status: string;
}

export function toLiveCard(m: ApiMatch): LiveCard {
  const ls = leagueStyle(m.competition?.slug);
  const isLive = m.status === "live";
  const isFinished = m.status === "finished";
  const minute = isLive
    ? `${m.minute ?? ""}'`
    : isFinished
    ? "FT"
    : "";
  const phase = isLive
    ? "Live"
    : isFinished
    ? "Full Time"
    : m.kickoff_at
    ? new Date(m.kickoff_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Upcoming";
  return {
    id: m.id,
    league: m.competition?.name ?? m.league ?? "",
    leagueAbbr: ls.abbr,
    leagueColor: ls.color,
    leagueLogo: m.competition?.logo_url ?? null,
    leagueProviderId: m.competition?.provider_competition_id ?? null,
    leagueProviderName: m.competition?.provider_name ?? null,
    phase,
    home: m.home_team?.name ?? "Home",
    homeAbbr: m.home_team?.abbr || abbrFromName(m.home_team?.name ?? "HOM"),
    homeColor: m.home_team ? colorFromString(m.home_team.name) : "#9095b8",
    homeLogo: m.home_team?.logo_url ?? null,
    homeProviderId: m.home_team?.provider_team_id ?? null,
    homeProviderName: m.home_team?.provider_name ?? null,
    away: m.away_team?.name ?? "Away",
    awayAbbr: m.away_team?.abbr || abbrFromName(m.away_team?.name ?? "AWA"),
    awayColor: m.away_team ? colorFromString(m.away_team.name) : "#9095b8",
    awayLogo: m.away_team?.logo_url ?? null,
    awayProviderId: m.away_team?.provider_team_id ?? null,
    awayProviderName: m.away_team?.provider_name ?? null,
    homeScore: m.home_score,
    awayScore: m.away_score,
    minute,
    hot: m.featured,
    status: m.status,
  };
}

export interface FixtureCard {
  id: number;
  date: string; // YYYY-MM-DD of kickoff
  home: string;
  homeAbbr: string;
  homeColor: string;
  homeLogo: string | null;
  homeProviderId: string | null;
  homeProviderName: string | null;
  away: string;
  awayAbbr: string;
  awayColor: string;
  awayLogo: string | null;
  awayProviderId: string | null;
  awayProviderName: string | null;
  time: string;
  league: string;
  leagueLogo: string | null;
  leagueProviderId: string | null;
  leagueProviderName: string | null;
  leagueSlug: string | null;
  status: "live" | "finished" | "upcoming";
  hs: number;
  as: number;
  min?: string;
}

export function toFixtureCard(m: ApiMatch): FixtureCard {
  const ls = leagueStyle(m.competition?.slug);
  const status: FixtureCard["status"] =
    m.status === "live" ? "live" : m.status === "finished" ? "finished" : "upcoming";
  let time = "—";
  if (m.kickoff_at) {
    const d = new Date(m.kickoff_at);
    time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return {
    id: m.id,
    date: m.kickoff_at ? m.kickoff_at.slice(0, 10) : "Unknown",
    home: m.home_team?.name ?? "Home",
    homeAbbr: m.home_team?.abbr || abbrFromName(m.home_team?.name ?? "HOM"),
    homeColor: m.home_team ? colorFromString(m.home_team.name) : "#9095b8",
    homeLogo: m.home_team?.logo_url ?? null,
    homeProviderId: m.home_team?.provider_team_id ?? null,
    homeProviderName: m.home_team?.provider_name ?? null,
    away: m.away_team?.name ?? "Away",
    awayAbbr: m.away_team?.abbr || abbrFromName(m.away_team?.name ?? "AWA"),
    awayColor: m.away_team ? colorFromString(m.away_team.name) : "#9095b8",
    awayLogo: m.away_team?.logo_url ?? null,
    awayProviderId: m.away_team?.provider_team_id ?? null,
    awayProviderName: m.away_team?.provider_name ?? null,
    time,
    league: ls.abbr || m.competition?.name || "",
    leagueLogo: m.competition?.logo_url ?? null,
    leagueProviderId: m.competition?.provider_competition_id ?? null,
    leagueProviderName: m.competition?.provider_name ?? null,
    leagueSlug: m.competition?.slug ?? null,
    status,
    hs: m.home_score,
    as: m.away_score,
    min: m.status === "live" ? `${m.minute ?? ""}'` : undefined,
  };
}

export interface StandingRow {
  pos: number;
  team: string;
  abbr: string;
  color: string;
  logo: string | null;
  provider_team_id?: string | null;
  provider_name?: string | null;
  slug: string | null;
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  zone: "champions" | "europa" | "relegation" | "normal";
}

export function toStandingRow(r: ApiStanding): StandingRow {
  let zone: StandingRow["zone"] = "normal";
  if (r.position <= 4) zone = "champions";
  else if (r.position >= 18) zone = "relegation";
  return {
    pos: r.position,
    team: r.team.name,
    abbr: abbrFromName(r.team.name),
    color: colorFromString(r.team.name),
    logo: r.team.logo_url,
    provider_team_id: (r.team as any).provider_team_id ?? null,
    provider_name: (r.team as any).provider_name ?? null,
    slug: r.team.slug,
    p: r.played,
    w: r.won,
    d: r.drawn,
    l: r.lost,
    gf: r.goals_for,
    ga: r.goals_against,
    gd: r.goal_difference,
    pts: r.points,
    zone,
  };
}

export interface CompetitionCard {
  id: number;
  name: string;
  abbr: string;
  season: string;
  color: string;
  logo: string | null;
  slug: string;
  featured: boolean;
  country?: string | null;
  provider_competition_id?: string | null;
  provider_name?: string | null;
}

export function toCompetitionCard(c: ApiCompetition): CompetitionCard {
  const ls = leagueStyle(c.slug);
  return {
    id: c.id,
    name: c.name,
    abbr: ls.abbr || abbrFromName(c.name),
    season: c.current_season ?? "",
    color: ls.color,
    logo: c.logo_url,
    slug: c.slug,
    featured: c.featured,
    country: c.country,
    provider_competition_id: c.provider_competition_id,
    provider_name: c.provider_name,
  };
}
