import { useEffect, useState } from "react";
import { Radio, Trophy, Play, ArrowRight, Film } from "lucide-react";
import type { Screen } from "./types";
import {
  getCompetitions, getLiveMatches, getMatches,
  toCompetitionCard, toFixtureCard, competitionLogoSources, teamLogoSources,
  type CompetitionCard, type FixtureCard,
} from "./api";
import { Crest } from "./Crest";
import { VideoPlayerModal, type VideoItem } from "./VideoPlayerModal";
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

const HOME_CLIPS: VideoItem[] = [
  { id: "fJ9rUzIMcZQ", title: "Real Madrid vs Barcelona — El Clásico All Goals", comp: "La Liga", time: "12:40", channel: "LaLiga" },
  { id: "L_LUpnjgPso", title: "Arsenal vs Manchester City — Title Race Epic", comp: "Premier League", time: "10:35", channel: "Sky Sports" },
  { id: "3e5lF71rOcg", title: "UCL Round of 16 — Best Goals", comp: "Champions League", time: "11:24", channel: "UEFA" },
  { id: "kJQP7kiw5Fk", title: "Premier League — Top 20 Goals of the Season", comp: "Premier League", time: "14:15", channel: "PL Official" },
  { id: "9bZkp7q19f0", title: "Inter vs AC Milan — Derby della Madonnina", comp: "Serie A", time: "11:50", channel: "Serie A" },
  { id: "JGwWNGJdvx8", title: "Vinicius · Mbappe · Haaland — Skills & Goals 2025", comp: "Superstars", time: "15:02", channel: "Football TV" },
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

  const load = () => {
    setError(false);
    Promise.all([getLiveMatches(), getMatches({ limit: 80 }), getCompetitions()])
      .then(([liveData, allData, compsData]) => {
        setLive(liveData.map(toFixtureCard));
        setMatches(allData.map(toFixtureCard));
        setCompetitions(compsData.map(toCompetitionCard));
      })
      .catch(() => setError(true));
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 25000);
    return () => window.clearInterval(timer);
  }, []);

  // Group matches by competition
  function groupByLeague(arr: FixtureCard[]) {
    const map = new Map<string, FixtureCard[]>();
    for (const m of arr) {
      const key = m.league || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }

  const today = todayKey();
  const tomorrow = tomorrowKey();
  const liveList = live ?? [];
  const upcoming = matches?.filter(m => m.date === today || m.date === tomorrow) ?? [];
  const allLeft = [...liveList, ...upcoming].slice(0, 40);
  const grouped = groupByLeague(allLeft);

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

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px", minHeight: "100%" }}>

        {/* ── Main two-column layout ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)",
          gap: 16,
          alignItems: "start",
        }}
          className="ms-home-grid"
        >

          {/* ═══ LEFT: Live & Today's matches grouped by league ═══ */}
          <div>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {liveList.length > 0 && (
                  <span className="ms-live-badge">
                    <span className="ms-live-badge-dot" />
                    LIVE {liveList.length}
                  </span>
                )}
                <h2 style={{
                  margin: 0, fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 18, fontWeight: 900, color: "var(--ms-text)",
                }}>
                  {liveList.length > 0 ? "Live & Today" : "Today's Matches"}
                </h2>
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
                All fixtures <ArrowRight size={13} />
              </button>
            </div>

            {/* Error / empty */}
            {error && (
              <div style={{ padding: 24, textAlign: "center", color: "var(--ms-muted)", fontSize: 13 }}>
                Could not load matches.{" "}
                <button type="button" onClick={load} style={{ color: "var(--ms-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>Retry</button>
              </div>
            )}

            {!error && allLeft.length === 0 && liveList.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "var(--ms-muted)", fontSize: 13 }}>
                No matches right now. Check the <button type="button" onClick={() => setActiveScreen("fixtures")} style={{ color: "var(--ms-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>fixtures schedule</button>.
              </div>
            )}

            {/* League groups */}
            {Array.from(grouped.entries()).map(([league, leagueMatches]) => {
              // Find competition logo
              const comp = competitions?.find(c =>
                c.name.toLowerCase().includes(league.toLowerCase().split(" ")[0]) ||
                league.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
              );
              const compLogoSrcs = comp
                ? competitionLogoSources({ slug: comp.slug, name: comp.name, logo_url: comp.logo, provider_competition_id: comp.provider_competition_id, provider_name: comp.provider_name })
                : [];

              return (
                <div key={league} className="ms-league-group">
                  {/* League header */}
                  <div className="ms-league-group-header">
                    {compLogoSrcs.length > 0 ? (
                      <Crest
                        srcs={compLogoSrcs}
                        name={league}
                        size={18}
                        style={{ borderRadius: 3, background: "rgba(255,255,255,0.06)" }}
                      />
                    ) : (
                      <Trophy size={14} color="var(--ms-muted)" />
                    )}
                    <span className="ms-league-group-name">{league}</span>
                    <span className="ms-league-group-count">{leagueMatches.length}</span>
                  </div>

                  {/* Compact match rows */}
                  <div className="ms-league-group-body">
                    {leagueMatches.map((m) => {
                      const isLive = isLiveStatus(m.status);
                      const isFt = (m.status || "").toUpperCase() === "FT";
                      const homeWin = isFt && (m.hs ?? 0) > (m.as ?? 0);
                      const awayWin = isFt && (m.as ?? 0) > (m.hs ?? 0);
                      const homeSrcs = teamLogoSources({ logo_url: m.homeLogo, provider_team_id: m.homeProviderId, provider_name: m.homeProviderName, name: m.home });
                      const awaySrcs = teamLogoSources({ logo_url: m.awayLogo, provider_team_id: m.awayProviderId, provider_name: m.awayProviderName, name: m.away });

                      return (
                        <div
                          key={m.id}
                          className={`ms-compact-match${isLive ? " is-live" : ""}`}
                          onClick={() => onOpenMatch(m.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && onOpenMatch(m.id)}
                        >
                          {/* Time column */}
                          <div className="ms-compact-time">
                            {isLive ? (
                              <>
                                <span className="ms-compact-time-min">{m.min || "LIVE"}</span>
                              </>
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

                          {/* Teams column */}
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

                          {/* Score / Live badge column */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                            {m.hs != null ? (
                              <div className="ms-compact-scores">
                                <span className={`ms-compact-score${homeWin ? "" : ""}`}>{m.hs}</span>
                                <span className={`ms-compact-score${awayWin ? "" : ""}`}>{m.as}</span>
                              </div>
                            ) : null}
                            {isLive && (
                              <span className="ms-live-badge" style={{ fontSize: 9, padding: "2px 5px" }}>
                                <span className="ms-live-badge-dot" />
                                LIVE
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

          {/* ═══ RIGHT: Highlights + Top Leagues ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Highlights panel */}
            <div className="ms-panel">
              <div className="ms-panel-head">
                <Film size={14} color="var(--ms-accent)" />
                Match Highlights
                <button
                  type="button"
                  onClick={() => setActiveScreen("highlights")}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
                    {/* Thumbnail */}
                    <div style={{
                      width: 56, height: 40, borderRadius: 6, flexShrink: 0,
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
            </div>

            {/* Top Leagues panel */}
            {competitions && competitions.length > 0 && (
              <div className="ms-panel">
                <div className="ms-panel-head">
                  <Trophy size={14} color="var(--ms-accent)" />
                  Top Leagues
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
                  {competitions.slice(0, 8).map((c) => {
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
                          padding: "10px 14px", background: "transparent",
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
                          size={26}
                          style={{ borderRadius: 4, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 700, color: "var(--ms-text)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {c.name}
                          </div>
                          {c.country && (
                            <div style={{ fontSize: 11, color: "var(--ms-muted)" }}>{c.country}</div>
                          )}
                        </div>
                        <ArrowRight size={13} color="var(--ms-faint)" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live now count card */}
            {liveList.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveScreen("live-list")}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(22,163,74,0.05) 100%)",
                  border: "1px solid rgba(22,163,74,0.25)",
                  borderRadius: 10, cursor: "pointer", width: "100%", textAlign: "left",
                  transition: "border-color 0.14s, background 0.14s",
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(22,163,74,0.5)";
                  b.style.background = "linear-gradient(135deg, rgba(22,163,74,0.22) 0%, rgba(22,163,74,0.08) 100%)";
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "rgba(22,163,74,0.25)";
                  b.style.background = "linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(22,163,74,0.05) 100%)";
                }}
              >
                <span style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(22,163,74,0.2)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Radio size={18} color="var(--ms-live-bright)" />
                </span>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1,
                  }}>
                    {liveList.length} Live Match{liveList.length !== 1 ? "es" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ms-live-bright)", marginTop: 2, fontWeight: 600 }}>
                    Watch now →
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive: single column on mobile */}
      <style>{`
        @media (max-width: 820px) {
          .ms-home-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Video modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          relatedVideos={HOME_CLIPS.filter(v => v.id !== activeVideo.id)}
          onClose={() => setActiveVideo(null)}
          onSelectVideo={setActiveVideo}
        />
      )}
    </>
  );
}
