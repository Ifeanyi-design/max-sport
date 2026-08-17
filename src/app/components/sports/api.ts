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

// --- Cosmetic helpers ------------------------------------------------------
// League styling keyed by the API competition slug.
export const LEAGUE_STYLES: Record<string, { abbr: string; color: string; flag: string }> = {
  "english-premier-league": { abbr: "EPL", color: "#7c3aed", flag: "🦁" },
  "uefa-champions-league": { abbr: "UCL", color: "#1a56db", flag: "🏆" },
  "la-liga": { abbr: "LL", color: "#e53e3e", flag: "🔴" },
  "serie-a": { abbr: "SA", color: "#0066b3", flag: "🇮🇹" },
  "bundesliga": { abbr: "BUN", color: "#d20515", flag: "🦅" },
  "ligue-1": { abbr: "L1", color: "#00a859", flag: "🇫🇷" },
  "uefa-europa-league": { abbr: "UEL", color: "#f97316", flag: "🟠" },
};

export function leagueStyle(slug?: string | null) {
  return LEAGUE_STYLES[slug ?? ""] ?? { abbr: "", color: "#9095b8", flag: "🌐" };
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
  leagueFlag: string;
  phase: string;
  home: string;
  homeAbbr: string;
  homeColor: string;
  away: string;
  awayAbbr: string;
  awayColor: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  hot: boolean;
  viewers: string;
  homeGoals: string[];
  awayGoals: string[];
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
    leagueFlag: ls.flag,
    phase,
    home: m.home_team?.name ?? "Home",
    homeAbbr: m.home_team?.abbr || abbrFromName(m.home_team?.name ?? "HOM"),
    homeColor: m.home_team ? colorFromString(m.home_team.name) : "#9095b8",
    away: m.away_team?.name ?? "Away",
    awayAbbr: m.away_team?.abbr || abbrFromName(m.away_team?.name ?? "AWA"),
    awayColor: m.away_team ? colorFromString(m.away_team.name) : "#9095b8",
    homeScore: m.home_score,
    awayScore: m.away_score,
    minute,
    hot: m.featured,
    viewers: "—",
    homeGoals: [],
    awayGoals: [],
  };
}

export interface FixtureCard {
  id: number;
  date: string; // YYYY-MM-DD of kickoff
  home: string;
  homeAbbr: string;
  homeColor: string;
  away: string;
  awayAbbr: string;
  awayColor: string;
  time: string;
  league: string;
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
    away: m.away_team?.name ?? "Away",
    awayAbbr: m.away_team?.abbr || abbrFromName(m.away_team?.name ?? "AWA"),
    awayColor: m.away_team ? colorFromString(m.away_team.name) : "#9095b8",
    time,
    league: ls.abbr || m.competition?.name || "",
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
  trend: "up" | "down" | "same";
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: string[];
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
    trend: "same",
    p: r.played,
    w: r.won,
    d: r.drawn,
    l: r.lost,
    gf: r.goals_for,
    ga: r.goals_against,
    gd: r.goal_difference,
    pts: r.points,
    form: [],
    zone,
  };
}

export interface CompetitionCard {
  id: number;
  name: string;
  abbr: string;
  season: string;
  color: string;
  phase: string;
  teams: number;
  icon: string;
  slug: string;
}

export function toCompetitionCard(c: ApiCompetition): CompetitionCard {
  const ls = leagueStyle(c.slug);
  return {
    id: c.id,
    name: c.name,
    abbr: ls.abbr || abbrFromName(c.name),
    season: c.current_season ?? "",
    color: ls.color,
    phase: "Season " + (c.current_season ?? ""),
    teams: 0,
    icon: ls.flag,
    slug: c.slug,
  };
}
