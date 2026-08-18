import { useEffect, useState } from "react";
import {
  Radio, Trophy, Play, ArrowRight, Film, Newspaper,
  Tv, Sparkles, Flame, Eye, Calendar
} from "lucide-react";
import type { Screen } from "./types";
import {
  getCompetitions, getLiveMatches, getMatches,
  toCompetitionCard, toFixtureCard, competitionLogoSources, teamLogoSources,
  type CompetitionCard, type FixtureCard,
} from "./api";
import { Crest } from "./Crest";
import { VideoPlayerModal, type VideoItem } from "./VideoPlayerModal";
import { NewsArticleModal, type NewsArticle } from "./NewsArticleModal";
import { LiveTicker } from "./LiveTicker";

interface Props {
  setActiveScreen: (screen: Screen) => void;
  onOpenMatch: (id: number) => void;
  onOpenCompetition: (slug: string) => void;
}

function todayKey() { return new Date().toISOString().slice(0, 10); }
function tomorrowKey() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function fmtDate(dateStr: string) {
  const today = todayKey(), tmr = tomorrowKey();
  if (dateStr === today) return "Today";
  if (dateStr === tmr) return "Tomorrow";
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short", day: "numeric", month: "short",
  });
}

// Broadcaster assignment helper
function getBroadcaster(league: string, matchId: number | string): { name: string; cls: string } {
  const l = (league || "").toLowerCase();
  if (l.includes("premier") || l.includes("epl")) return { name: "SuperSport PL", cls: "ms-tv-supersport" };
  if (l.includes("la liga") || l.includes("laliga")) return { name: "SuperSport LaLiga", cls: "ms-tv-supersport" };
  if (l.includes("champions") || l.includes("ucl")) return { name: "TNT Sports 1", cls: "ms-tv-tnt" };
  if (l.includes("serie a") || l.includes("ital")) return { name: "beIN Sports 1", cls: "ms-tv-bein" };
  if (l.includes("bundesliga") || l.includes("german")) return { name: "Sky Sports Mix", cls: "ms-tv-skysports" };
  if (Number(matchId) % 2 === 0) return { name: "DAZN 1", cls: "ms-tv-dazn" };
  return { name: "MaxSport Live", cls: "ms-tv-supersport" };
}

const HOME_CLIPS: VideoItem[] = [
  { id: "fJ9rUzIMcZQ", title: "Real Madrid vs Barcelona — El Clásico All Goals & Match Highlights", comp: "La Liga", time: "12:40", channel: "LaLiga" },
  { id: "L_LUpnjgPso", title: "Arsenal vs Manchester City — High Stakes Title Race Epic Clash", comp: "Premier League", time: "10:35", channel: "Sky Sports" },
  { id: "3e5lF71rOcg", title: "UEFA Champions League — Round of 16 Best Goals & Drama", comp: "Champions League", time: "11:24", channel: "UEFA" },
  { id: "kJQP7kiw5Fk", title: "Premier League — Top 20 Best Goals of the Season", comp: "Premier League", time: "14:15", channel: "PL Official" },
  { id: "9bZkp7q19f0", title: "Inter vs AC Milan — Derby della Madonnina Drama & All Goals", comp: "Serie A", time: "11:50", channel: "Serie A" },
  { id: "JGwWNGJdvx8", title: "Vinicius Jr, Mbappe & Haaland — Best Skills & Goals Show 2025", comp: "Superstars", time: "15:02", channel: "Football TV" },
];

const TRENDING_NEWS: NewsArticle[] = [
  {
    id: 1,
    tag: "Transfer News",
    title: "Real Madrid prepare record-breaking summer bid as Kylian Mbappé hits peak dynamic form",
    time: "25m ago",
    source: "The Athletic",
    img: "/match_action.jpg",
    readTime: "3 min read",
    paragraphs: [
      "Real Madrid's sporting directorate has finalized their summer recruitment targets following an exceptional run of performances across Europe and domestic competition. Kylian Mbappé's dynamic tactical integration into the center-forward and inverted winger roles has opened up unprecedented attacking metrics.",
      "Internal scouting reports indicate that the Spanish champions will prioritize securing elite midfield depth and an attacking full-back to complement Vinicius Jr and Jude Bellingham. Club officials remain confident that their structure will maintain domestic supremacy while defending European titles.",
      "The coaching staff highlighted how Mbappé's off-the-ball runs have created high-value scoring chances, averaging over 3.4 expected goal contributions per 90 minutes in high-stakes fixtures.",
    ],
  },
  {
    id: 2,
    tag: "Premier League",
    title: "Mikel Arteta reacts to intense title race pressure: 'Every single match is treated as a cup final'",
    time: "1h ago",
    source: "Sky Sports",
    img: "/stadium_night.jpg",
    readTime: "4 min read",
    paragraphs: [
      "Arsenal manager Mikel Arteta praised his team's mental resilience after a relentless stretch of Premier League and continental fixtures. Addressing journalists at London Colney, Arteta emphasized that margin for error at the top of the table has reduced to zero.",
      "'When you are competing against the best teams in world football, consistency is everything,' said Arteta. 'We prepare every single training session with the mindset that the upcoming fixture will determine our entire season.'",
      "With key defenders returning from injury ahead of the crunch fixture schedule, the Gunners boast the league's top defensive record, conceding the fewest open-play chances across the top five European leagues.",
    ],
  },
  {
    id: 3,
    tag: "Champions League",
    title: "UEFA confirms updated knockout tournament format & golden trophy ceremony for 2026/27",
    time: "2h ago",
    source: "UEFA News",
    img: "/championship.jpg",
    readTime: "3 min read",
    paragraphs: [
      "UEFA has officially released the updated tournament regulations for the upcoming European club competitions. The expanded 36-team single-table league phase will feature revised seeding mechanics and higher financial distribution pools.",
      "Under the new provisions, round-of-16 seedings will directly reward regular season performance, providing higher-ranked teams with second-leg home advantage throughout the knockout stages.",
      "Broadcasters and supporters worldwide will also benefit from enhanced real-time match analytics and multi-angle 4K streaming feeds accessible across global partner platforms.",
    ],
  },
  {
    id: 4,
    tag: "Tactical Analysis",
    title: "How Manchester City's midfield diamond broke down deep defensive low blocks this weekend",
    time: "3h ago",
    source: "Opta Analyst",
    img: "/hero_banner.jpg",
    readTime: "5 min read",
    paragraphs: [
      "A deep tactical dive into Pep Guardiola's latest midfield adjustments reveals why opposing teams have struggled to contain inverted full-backs tucking into central channels.",
      "By creating numerical overloads in the half-spaces, City generated over 18 entries into the penalty area, resulting in 6 big chances and high-percentage cutback opportunities.",
      "Data metrics confirm that switching the point of attack at higher tempo prevented defenders from doubling up on wide wingers, creating space for direct through-balls.",
    ],
  },
];

function isLiveStatus(s: string) {
  const u = (s || "").toUpperCase();
  return u === "LIVE" || u === "HT" || u === "ET" || u === "PEN" ||
    /^\d+[''']?$/.test(u);
}

export function SportsHomePage({ setActiveScreen, onOpenMatch, onOpenCompetition }: Props) {
  const [live, setLive] = useState<FixtureCard[] | null>(null);
  const [matches, setMatches] = useState<FixtureCard[] | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionCard[] | null>(null);
  const [error, setError] = useState(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "epl" | "laliga" | "ucl" | "finished">("all");
  const [rightTab, setRightTab] = useState<"highlights" | "news">("highlights");

  const load = (silent = false) => {
    if (!silent) setError(false);
    Promise.all([getLiveMatches(), getMatches({ limit: 80 }), getCompetitions()])
      .then(([liveData, allData, compsData]) => {
        setLive(liveData.map(toFixtureCard));
        setMatches(allData.map(toFixtureCard));
        setCompetitions(compsData.map(toCompetitionCard));
      })
      .catch(() => {
        if (!silent) setError(true);
      });
  };

  useEffect(() => {
    load(false);
    const timer = window.setInterval(() => load(true), 25000);
    return () => window.clearInterval(timer);
  }, []);

  const today = todayKey();
  const tomorrow = tomorrowKey();
  const liveList = live ?? [];
  const upcoming = matches?.filter(m => m.date === today || m.date === tomorrow || m.status === "scheduled") ?? [];
  const allLeft = [...liveList, ...upcoming];

  // Featured Spotlight Hero match (DAZN/FIFA+ style)
  const heroMatch = liveList[0] || upcoming[0] || (matches && matches[0]) || null;

  // Filter matches based on user's quick filter pill
  const filteredMatches = allLeft.filter(m => {
    if (statusFilter === "live") return isLiveStatus(m.status);
    if (statusFilter === "finished") return (m.status || "").toUpperCase() === "FT";
    if (statusFilter === "epl") return (m.league || "").toLowerCase().includes("premier") || (m.league || "").toLowerCase().includes("epl");
    if (statusFilter === "laliga") return (m.league || "").toLowerCase().includes("la liga") || (m.league || "").toLowerCase().includes("laliga");
    if (statusFilter === "ucl") return (m.league || "").toLowerCase().includes("champions") || (m.league || "").toLowerCase().includes("ucl");
    return true;
  }).slice(0, 45);

  // Group matches by competition
  function groupByLeague(arr: FixtureCard[]) {
    const map = new Map<string, FixtureCard[]>();
    for (const m of arr) {
      const key = m.league || "Other Matches";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }

  const grouped = groupByLeague(filteredMatches);

  return (
    <>
      {/* Live Ticker */}
      <LiveTicker
        matches={liveList.map(m => ({
          id: m.id, home: m.home, away: m.away,
          hs: m.hs, as: m.as, min: m.min, status: m.status,
          homeLogo: m.homeLogo, awayLogo: m.awayLogo,
          homeProviderId: m.homeProviderId, awayProviderId: m.awayProviderId,
          homeProviderName: m.homeProviderName, awayProviderName: m.awayProviderName,
        }))}
        onMatchClick={(id) => onOpenMatch(id as number)}
      />

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "12px clamp(8px, 2vw, 16px)", minHeight: "100%" }}>

        {/* ── 1. OTT FEATURED SHOWCASE (DAZN / FIFA+ style) ── */}
        {heroMatch && (
          <div className="ms-ott-hero">
            {/* Background stadium image with broadcast vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/stadium_night.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center 35%",
                opacity: 0.35,
                transform: "scale(1.02)",
              }}
            />
            <div className="ms-ott-hero-bg" />
            <div className="ms-ott-hero-content">

              {/* Top pill row */}
              <div className="ms-ott-pill-row">
                {isLiveStatus(heroMatch.status) ? (
                  <span className="ms-ott-badge-live">
                    <span className="ms-live-badge-dot" /> LIVE STREAM
                  </span>
                ) : (
                  <span className="ms-ott-badge-comp" style={{ background: "var(--ms-accent-soft)", borderColor: "var(--ms-border-accent)", color: "var(--ms-accent)" }}>
                    <Flame size={12} /> MATCH OF THE NIGHT
                  </span>
                )}

                {heroMatch.league && (
                  <span className="ms-ott-badge-comp">
                    <Trophy size={12} color="var(--ms-muted)" />
                    {heroMatch.league}
                  </span>
                )}

                {/* Broadcaster pill */}
                <span className={`ms-tv-badge ${getBroadcaster(heroMatch.league || "", heroMatch.id).cls}`}>
                  <Tv size={10} /> {getBroadcaster(heroMatch.league || "", heroMatch.id).name}
                </span>

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ms-muted)" }}>
                  <Eye size={12} color="var(--ms-live-bright)" />
                  <strong style={{ color: "var(--ms-text-2)" }}>48.2k</strong>
                </div>
              </div>

              {/* Teams & Score Row */}
              <div className="ms-ott-teams-row">
                {/* Home Team */}
                <div className="ms-ott-team-block">
                  <Crest
                    srcs={teamLogoSources({ name: heroMatch.home, logo_url: heroMatch.homeLogo, provider_team_id: heroMatch.homeProviderId, provider_name: heroMatch.homeProviderName })}
                    name={heroMatch.home}
                    size={44}
                    radius={8}
                  />
                  <div className="ms-ott-team-name">{heroMatch.home}</div>
                </div>

                {/* Center score or time */}
                <div className="ms-ott-score-center">
                  {heroMatch.hs != null ? (
                    <div className="ms-ott-score-val">
                      {heroMatch.hs} – {heroMatch.as}
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 24, fontWeight: 900, color: "#fff",
                    }}>
                      {heroMatch.time || "VS"}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: isLiveStatus(heroMatch.status) ? "var(--ms-live-bright)" : "var(--ms-muted)", fontWeight: 700 }}>
                    {isLiveStatus(heroMatch.status) ? (heroMatch.min || "LIVE") : fmtDate(heroMatch.date)}
                  </div>
                </div>

                {/* Away Team */}
                <div className="ms-ott-team-block" style={{ justifyContent: "flex-end", textAlign: "right" }}>
                  <div className="ms-ott-team-name">{heroMatch.away}</div>
                  <Crest
                    srcs={teamLogoSources({ name: heroMatch.away, logo_url: heroMatch.awayLogo, provider_team_id: heroMatch.awayProviderId, provider_name: heroMatch.awayProviderName })}
                    name={heroMatch.away}
                    size={44}
                    radius={8}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => onOpenMatch(heroMatch.id)}
                  className="ms-btn ms-btn-primary"
                  style={{ flex: 1, minWidth: 140, padding: "8px 16px", fontSize: 12, fontWeight: 800, borderRadius: 8 }}
                >
                  <Play size={13} fill="#fff" /> Watch Live Stream
                </button>
                <button
                  type="button"
                  onClick={() => onOpenMatch(heroMatch.id)}
                  className="ms-btn"
                  style={{ flex: 1, minWidth: 140, padding: "8px 14px", fontSize: 12, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}
                >
                  Match Centre
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── 2. FLASHSCORE QUICK FILTER PILLS BAR ── */}
        <div className="ms-quick-filter-bar">
          <button
            type="button"
            className={`ms-qf-btn${statusFilter === "all" ? " is-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Matches
          </button>
          <button
            type="button"
            className={`ms-qf-btn${statusFilter === "live" ? " is-live-active" : ""}`}
            onClick={() => setStatusFilter("live")}
          >
            <span className="ms-live-badge-dot" style={{ width: 4, height: 4 }} />
            Live Now ({liveList.length})
          </button>
          <button
            type="button"
            className={`ms-qf-btn${statusFilter === "epl" ? " is-active" : ""}`}
            onClick={() => setStatusFilter("epl")}
          >
            Premier League
          </button>
          <button
            type="button"
            className={`ms-qf-btn${statusFilter === "laliga" ? " is-active" : ""}`}
            onClick={() => setStatusFilter("laliga")}
          >
            La Liga
          </button>
          <button
            type="button"
            className={`ms-qf-btn${statusFilter === "ucl" ? " is-active" : ""}`}
            onClick={() => setStatusFilter("ucl")}
          >
            Champions League
          </button>
          <button
            type="button"
            className={`ms-qf-btn${statusFilter === "finished" ? " is-active" : ""}`}
            onClick={() => setStatusFilter("finished")}
          >
            Finished
          </button>
        </div>

        {/* ── 3. TWO-COLUMN DASHBOARD (Stacks 1-col on mobile) ── */}
        <div className="ms-home-grid">

          {/* ═══ LEFT: Live & Grouped Fixtures ═══ */}
          <div>
            {/* Section Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{
                  margin: 0, fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 18, fontWeight: 900, color: "var(--ms-text)",
                }}>
                  {statusFilter === "live" ? "Live Fixtures" : "Match Schedule & Scores"}
                </h2>
                <span style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 700 }}>
                  ({filteredMatches.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveScreen("fixtures")}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--ms-accent)", fontSize: 12, fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Full calendar <ArrowRight size={12} />
              </button>
            </div>

            {/* Error / Empty state */}
            {error && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ms-muted)", fontSize: 13 }}>
                Could not load matches.{" "}
                <button type="button" onClick={load} style={{ color: "var(--ms-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Retry</button>
              </div>
            )}

            {!error && filteredMatches.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "var(--ms-muted)", fontSize: 13, background: "var(--ms-surface)", borderRadius: 10, border: "1px solid var(--ms-border)" }}>
                No matches found in this category.{" "}
                <button type="button" onClick={() => setStatusFilter("all")} style={{ color: "var(--ms-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>View all matches</button>
              </div>
            )}

            {/* Grouped Match Rows */}
            {Array.from(grouped.entries()).map(([league, leagueMatches]) => {
              const comp = competitions?.find(c =>
                c.name.toLowerCase().includes(league.toLowerCase().split(" ")[0]) ||
                league.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
              );
              const compLogoSrcs = comp
                ? competitionLogoSources({ slug: comp.slug, name: comp.name, logo_url: comp.logo, provider_competition_id: comp.provider_competition_id, provider_name: comp.provider_name })
                : [];

              return (
                <div key={league} className="ms-league-group">
                  {/* League Header */}
                  <div className="ms-league-group-header">
                    {compLogoSrcs.length > 0 ? (
                      <Crest srcs={compLogoSrcs} name={league} size={18} style={{ borderRadius: 3, background: "rgba(255,255,255,0.06)" }} />
                    ) : (
                      <Trophy size={14} color="var(--ms-muted)" />
                    )}
                    <span className="ms-league-group-name">{league}</span>
                    <span className="ms-league-group-count">{leagueMatches.length}</span>
                  </div>

                  {/* Compact Rows */}
                  <div className="ms-league-group-body">
                    {leagueMatches.map((m) => {
                      const isLive = isLiveStatus(m.status);
                      const isFt = (m.status || "").toUpperCase() === "FT";
                      const homeWin = isFt && (m.hs ?? 0) > (m.as ?? 0);
                      const awayWin = isFt && (m.as ?? 0) > (m.hs ?? 0);
                      const homeSrcs = teamLogoSources({ logo_url: m.homeLogo, provider_team_id: m.homeProviderId, provider_name: m.homeProviderName, name: m.home });
                      const awaySrcs = teamLogoSources({ logo_url: m.awayLogo, provider_team_id: m.awayProviderId, provider_name: m.awayProviderName, name: m.away });
                      const broadcaster = getBroadcaster(m.league || "", m.id);

                      return (
                        <div
                          key={m.id}
                          className={`ms-compact-match${isLive ? " is-live" : ""}`}
                          onClick={() => onOpenMatch(m.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && onOpenMatch(m.id)}
                        >
                          {/* Time Column */}
                          <div className="ms-compact-time">
                            {isLive ? (
                              <span className="ms-compact-time-min">{m.min || "LIVE"}</span>
                            ) : isFt ? (
                              <span className="ms-compact-time-val" style={{ color: "var(--ms-muted)", fontSize: 11 }}>FT</span>
                            ) : (
                              <>
                                {m.date !== today && m.date !== tomorrow && (
                                  <span className="ms-compact-time-date">{fmtDate(m.date)}</span>
                                )}
                                <span className="ms-compact-time-val">{m.time}</span>
                              </>
                            )}
                          </div>

                          {/* Teams Column */}
                          <div className="ms-compact-teams">
                            <div className={`ms-compact-team${homeWin ? " winner" : ""}`}>
                              <Crest srcs={homeSrcs} name={m.home} size={16} style={{ flexShrink: 0 }} />
                              <span>{m.home}</span>
                            </div>
                            <div className={`ms-compact-team${awayWin ? " winner" : ""}`}>
                              <Crest srcs={awaySrcs} name={m.away} size={16} style={{ flexShrink: 0 }} />
                              <span>{m.away}</span>
                            </div>
                          </div>

                          {/* Broadcaster + Score Column */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                            {m.hs != null ? (
                              <div className="ms-compact-scores">
                                <span className="ms-compact-score">{m.hs}</span>
                                <span className="ms-compact-score">{m.as}</span>
                              </div>
                            ) : (
                              <span className={`ms-tv-badge ${broadcaster.cls}`} style={{ fontSize: 9 }}>
                                <Tv size={9} /> {broadcaster.name}
                              </span>
                            )}
                            {isLive && (
                              <span className="ms-live-badge" style={{ fontSize: 9, padding: "2px 5px" }}>
                                <span className="ms-live-badge-dot" /> LIVE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ═══ RIGHT: Multimedia / News / Top Leagues (365Scores style) ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Media Hub: Highlights vs News Switcher */}
            <div className="ms-panel">
              <div className="ms-panel-head" style={{ padding: "8px 12px", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setRightTab("highlights")}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 800,
                    background: rightTab === "highlights" ? "var(--ms-accent)" : "transparent",
                    color: rightTab === "highlights" ? "#fff" : "var(--ms-muted)",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.14s ease",
                  }}
                >
                  <Film size={13} /> Match Highlights
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab("news")}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 800,
                    background: rightTab === "news" ? "var(--ms-accent)" : "transparent",
                    color: rightTab === "news" ? "#fff" : "var(--ms-muted)",
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.14s ease",
                  }}
                >
                  <Newspaper size={13} /> Trending News
                </button>
              </div>

              {/* TAB 1: Highlights Video Feed */}
              {rightTab === "highlights" ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {HOME_CLIPS.map((clip) => (
                    <button
                      key={clip.id}
                      type="button"
                      onClick={() => setActiveVideo(clip)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 14px", background: "transparent", border: "none",
                        cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        textAlign: "left", width: "100%",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                    >
                      <div style={{
                        width: 58, height: 40, borderRadius: 6, flexShrink: 0,
                        background: `url(https://img.youtube.com/vi/${clip.id}/default.jpg) center/cover`,
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "rgba(0,0,0,0.35)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Play size={12} fill="#fff" color="#fff" />
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 600, color: "var(--ms-text)",
                          lineHeight: 1.3,
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {clip.title}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ms-muted)", marginTop: 2 }}>
                          {clip.comp} · {clip.time}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* TAB 2: Trending Football Headlines */
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {TRENDING_NEWS.map((news) => (
                    <button
                      key={news.id}
                      type="button"
                      onClick={() => setActiveArticle(news)}
                      className="ms-news-item"
                      style={{
                        background: "transparent",
                        border: "none",
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 58,
                          height: 44,
                          borderRadius: 6,
                          flexShrink: 0,
                          backgroundImage: `url('${news.img}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="ms-news-tag">{news.tag}</span>
                        <h4 className="ms-news-headline">{news.title}</h4>
                        <div className="ms-news-time">{news.source} · {news.time}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Top Leagues */}
            {competitions && competitions.length > 0 && (
              <div className="ms-panel">
                <div className="ms-panel-head">
                  <Trophy size={14} color="var(--ms-accent)" />
                  Major Tournaments
                  <button
                    type="button"
                    onClick={() => setActiveScreen("competitions")}
                    style={{
                      marginLeft: "auto", display: "flex", alignItems: "center", gap: 3,
                      background: "transparent", border: "none", cursor: "pointer",
                      color: "var(--ms-accent)", fontSize: 11, fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    All <ArrowRight size={11} />
                  </button>
                </div>
                <div>
                  {competitions.slice(0, 7).map((c) => {
                    const srcs = competitionLogoSources({
                      slug: c.slug, name: c.name, logo_url: c.logo,
                      provider_competition_id: c.provider_competition_id,
                      provider_name: c.provider_name,
                    });
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => onOpenCompetition(c.slug)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 14px", background: "transparent",
                          border: "none", cursor: "pointer", width: "100%",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          textAlign: "left", transition: "background 0.12s",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                      >
                        <Crest
                          srcs={srcs}
                          name={c.name}
                          size={24}
                          style={{ borderRadius: 4, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 12, fontWeight: 750, color: "var(--ms-text)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {c.name}
                          </div>
                          {c.country && (
                            <div style={{ fontSize: 10, color: "var(--ms-muted)" }}>{c.country}</div>
                          )}
                        </div>
                        <ArrowRight size={12} color="var(--ms-faint)" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          relatedVideos={HOME_CLIPS.filter(v => v.id !== activeVideo.id)}
          onClose={() => setActiveVideo(null)}
          onSelectVideo={setActiveVideo}
        />
      )}

      {/* Full News Article Modal */}
      {activeArticle && (
        <NewsArticleModal
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
          onOpenHighlights={() => {
            setActiveArticle(null);
            setActiveScreen("highlights");
          }}
        />
      )}
    </>
  );
}
