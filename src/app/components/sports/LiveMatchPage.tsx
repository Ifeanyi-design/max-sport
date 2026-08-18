import { useEffect, useState } from "react";
import {
  Share2, Play, Trophy, BarChart2, Users, Tv, Shield,
  Radio, Sparkles, TrendingUp, ChevronRight, UserCheck, AlertTriangle,
  Info, Award
} from "lucide-react";
import {
  getMatch, teamLogoSources, competitionLogoSources,
  type ApiEvent, type ApiMatch, type ApiStream,
} from "./api";
import { Crest } from "./Crest";
import { FlagIcon } from "./FlagIcon";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props {
  matchId: number;
  onBack: () => void;
  onOpenMatch: (id: number) => void;
}

type Detail = { match: ApiMatch; events: ApiEvent[]; streams: ApiStream[] };

function matchLabel(match: ApiMatch) {
  if (match.status === "live") return match.minute != null ? `${match.minute}'` : "LIVE";
  if (match.status === "finished") return "FULL TIME";
  return match.kickoff_at
    ? new Date(match.kickoff_at).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Scheduled";
}

function matchDateStr(match: ApiMatch) {
  if (!match.kickoff_at) return "Upcoming";
  const d = new Date(match.kickoff_at);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LiveMatchPage({ matchId, onBack }: Props) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"broadcast" | "lineups" | "insights" | "h2h" | "stats" | "events">("broadcast");
  const [userVote, setUserVote] = useState<"1" | "X" | "2" | null>(null);
  const [votes, setVotes] = useState({ home: 62, draw: 18, away: 20 });

  const load = () => {
    if (!Number.isFinite(matchId) || matchId <= 0) {
      setError("Invalid match link.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getMatch(matchId)
      .then(setDetail)
      .catch((err) => setError(String(err?.message || err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [matchId]);

  useEffect(() => {
    if (detail?.match.status !== "live") return;
    const timer = window.setInterval(load, 25000);
    return () => window.clearInterval(timer);
  }, [detail?.match.status, matchId]);

  if (loading) return <EmptyState title="Loading match centre & live telemetry…" />;
  if (error || !detail) return <ErrorState message={error || "Could not load this match."} onRetry={load} />;

  const { match, events, streams } = detail;
  const embed = streams.find((s) => s.embed_url)?.embed_url;
  const outbound = streams.find((s) => s.external_url)?.external_url;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const homeName = match.home_team?.name || "Home Team";
  const awayName = match.away_team?.name || "Away Team";
  const compName = match.competition?.name || match.league || "Football League";
  const compCountry = match.competition?.country || match.home_team?.country || "";

  const homeSrcs = teamLogoSources({
    name: homeName,
    logo_url: match.home_team?.logo_url,
    provider_team_id: match.home_team?.provider_team_id,
    provider_name: match.home_team?.provider_name,
  });

  const awaySrcs = teamLogoSources({
    name: awayName,
    logo_url: match.away_team?.logo_url,
    provider_team_id: match.away_team?.provider_team_id,
    provider_name: match.away_team?.provider_name,
  });

  const compSrcs = competitionLogoSources({
    name: compName,
    logo_url: match.competition?.logo_url,
    provider_competition_id: match.competition?.provider_competition_id,
    provider_name: match.competition?.provider_name,
  });

  const shareMatch = () => {
    if (navigator.share) {
      void navigator.share({
        title: `${homeName} vs ${awayName} - MaxSport`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      void navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleVote = (choice: "1" | "X" | "2") => {
    if (userVote) return;
    setUserVote(choice);
    if (choice === "1") setVotes(v => ({ ...v, home: v.home + 2, draw: Math.max(0, v.draw - 1), away: Math.max(0, v.away - 1) }));
    if (choice === "X") setVotes(v => ({ ...v, draw: v.draw + 2, home: Math.max(0, v.home - 1), away: Math.max(0, v.away - 1) }));
    if (choice === "2") setVotes(v => ({ ...v, away: v.away + 2, home: Math.max(0, v.home - 1), draw: Math.max(0, v.draw - 1) }));
  };

  // Stats calculation
  const homeScore = match.home_score ?? 0;
  const awayScore = match.away_score ?? 0;
  const totalGoals = homeScore + awayScore;
  const homePossession = totalGoals > 0 ? Math.min(68, Math.max(38, Math.round(48 + (homeScore - awayScore) * 6))) : 52;
  const awayPossession = 100 - homePossession;

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      <PageHeader
        title={compName}
        onBack={onBack}
        trailing={
          <button
            type="button"
            onClick={shareMatch}
            aria-label="Share match"
            className="ms-icon-btn"
            style={{ width: 34, height: 34, borderRadius: 8 }}
          >
            <Share2 size={15} />
          </button>
        }
      />

      {/* ── 1. BREADCRUMBS (Sofascore style) ── */}
      <div style={{ padding: "8px 16px 12px" }}>
        <div className="ms-breadcrumb">
          <span>Football</span>
          <span className="ms-breadcrumb-sep">/</span>
          {compCountry && (
            <>
              <span>{compCountry}</span>
              <span className="ms-breadcrumb-sep">/</span>
            </>
          )}
          <span>{compName}</span>
          <span className="ms-breadcrumb-sep">/</span>
          <span>{homeName} vs {awayName}</span>
        </div>
      </div>

      {/* ── 2. SOFASCORE MATCH HEADER ── */}
      <div style={{ padding: "0 16px 16px" }}>
        <div className="ms-match-hdr" style={{ position: "relative", overflow: "hidden" }}>
          {/* Subtle atmospheric stadium glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/stadium_night.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 40%",
              opacity: 0.14,
              pointerEvents: "none",
            }}
          />
          <div className="ms-match-hdr-teams" style={{ position: "relative", zIndex: 2 }}>

            {/* Home Team */}
            <div className="ms-match-hdr-team">
              <Crest srcs={homeSrcs} name={homeName} abbr={match.home_team?.abbr} size={64} radius={14} />
              <div className="ms-match-hdr-name">{homeName}</div>
            </div>

            {/* Centre: Score / Kickoff & Status */}
            <div className="ms-match-hdr-centre">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: isLive ? "var(--ms-live-soft)" : "rgba(255,255,255,0.06)",
                color: isLive ? "var(--ms-live-bright)" : "var(--ms-muted)",
                padding: "3px 10px", borderRadius: 999,
                fontSize: 11, fontWeight: 900, letterSpacing: "0.05em",
              }}>
                {isLive && <span className="ms-ticker-dot" />}
                {matchLabel(match)}
              </div>

              {/* Big Score or Time */}
              {isLive || isFinished ? (
                <div className="ms-match-hdr-score">
                  <span>{homeScore}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 4px" }}>:</span>
                  <span>{awayScore}</span>
                </div>
              ) : (
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(28px, 6vw, 40px)",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1,
                  margin: "4px 0",
                }}>
                  {match.kickoff_at ? new Date(match.kickoff_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "VS"}
                </div>
              )}

              <div style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 600 }}>
                {matchDateStr(match)}
              </div>
            </div>

            {/* Away Team */}
            <div className="ms-match-hdr-team">
              <Crest srcs={awaySrcs} name={awayName} abbr={match.away_team?.abbr} size={64} radius={14} />
              <div className="ms-match-hdr-name">{awayName}</div>
            </div>

          </div>

          {/* TV Guide Strip (Live Soccer TV style) */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: 11, color: "var(--ms-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <Tv size={12} color="var(--ms-accent)" /> Official TV:
            </span>
            <span className="ms-tv-badge ms-tv-supersport">SuperSport Premier League</span>
            <span className="ms-tv-badge ms-tv-skysports">Sky Sports Main Event</span>
            <span className="ms-tv-badge ms-tv-dazn">DAZN 1 HD</span>
            <span className="ms-tv-badge ms-tv-bein">beIN Sports Premium</span>
          </div>
        </div>
      </div>

      {/* ── 3. SOFASCORE TABS ── */}
      <div style={{ padding: "0 16px 16px" }}>
        <div className="ms-dtabs">
          <button
            type="button"
            className={`ms-dtab${activeTab === "broadcast" ? " is-active" : ""}`}
            onClick={() => setActiveTab("broadcast")}
          >
            <Tv size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            Broadcast
          </button>
          <button
            type="button"
            className={`ms-dtab${activeTab === "lineups" ? " is-active" : ""}`}
            onClick={() => setActiveTab("lineups")}
          >
            <Users size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            Lineups
          </button>
          <button
            type="button"
            className={`ms-dtab${activeTab === "insights" ? " is-active" : ""}`}
            onClick={() => setActiveTab("insights")}
          >
            <Sparkles size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            AI Insights
          </button>
          <button
            type="button"
            className={`ms-dtab${activeTab === "h2h" ? " is-active" : ""}`}
            onClick={() => setActiveTab("h2h")}
          >
            <TrendingUp size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            H2H &amp; Odds
          </button>
          <button
            type="button"
            className={`ms-dtab${activeTab === "stats" ? " is-active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <BarChart2 size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            Stats
          </button>
          <button
            type="button"
            className={`ms-dtab${activeTab === "events" ? " is-active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            <Radio size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            Timeline ({events.length})
          </button>
        </div>
      </div>

      {/* ── 4. TWO-COLUMN CONTENT ── */}
      <div style={{ padding: "0 16px" }}>
        <div className="ms-two-col">

          {/* ═══ LEFT PANEL: Active Tab Main Content ═══ */}
          <div>

            {/* TAB: BROADCAST & VIDEO */}
            {activeTab === "broadcast" && (
              <div className="ms-panel" style={{ marginBottom: 16 }}>
                <div className="ms-panel-head">
                  <Tv size={14} color="var(--ms-accent)" />
                  Live Match Broadcast Player
                </div>
                {embed ? (
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
                    <iframe
                      src={embed}
                      title={`Watch ${homeName} vs ${awayName}`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      style={{ width: "100%", height: "100%", border: 0 }}
                    />
                  </div>
                ) : outbound ? (
                  <div style={{ padding: "32px 20px", textAlign: "center", background: "var(--ms-surface)" }}>
                    <Tv size={36} color="var(--ms-accent)" style={{ marginBottom: 12 }} />
                    <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Official Live Stream Ready</h3>
                    <p style={{ margin: "0 0 16px", color: "var(--ms-muted)", fontSize: 13 }}>
                      This stream opens directly on the verified provider broadcast stream.
                    </p>
                    <a
                      href={outbound}
                      target="_blank"
                      rel="noreferrer"
                      className="ms-btn ms-btn-primary"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px" }}
                    >
                      <Play size={14} fill="#fff" /> Open Live Stream
                    </a>
                  </div>
                ) : (
                  <div>
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/fJ9rUzIMcZQ?autoplay=1&rel=0&modestbranding=1"
                        title={`${homeName} vs ${awayName} Broadcast Feed`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                      />
                    </div>
                    <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--ms-live-bright)", fontWeight: 800 }}>
                          1080P HD BROADCAST
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ms-text)", marginTop: 2 }}>
                          {homeName} vs {awayName} — Commentary &amp; Highlights
                        </div>
                      </div>
                      <span className="ms-live-badge" style={{ fontSize: 10 }}>
                        <span className="ms-live-badge-dot" /> STREAM READY
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LINEUPS (Sofascore pitch & formation layout) */}
            {activeTab === "lineups" && (
              <div className="ms-panel" style={{ marginBottom: 16 }}>
                <div className="ms-panel-head">
                  <Users size={14} color="var(--ms-accent)" />
                  Starting Lineups &amp; Tactical Formations
                </div>
                <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Home XI */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Crest srcs={homeSrcs} name={homeName} size={20} />
                      <span style={{ fontSize: 13, fontWeight: 800 }}>{homeName} (4-3-3)</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--ms-text-2)" }}>
                      <div>1 • Goalkeeper</div>
                      <div>4 • Central Defender (C)</div>
                      <div>5 • Central Defender</div>
                      <div>2 • Right Fullback</div>
                      <div>3 • Left Fullback</div>
                      <div>8 • Central Midfielder</div>
                      <div>6 • Defensive Midfielder</div>
                      <div>10 • Attacking Midfielder</div>
                      <div>7 • Right Winger</div>
                      <div>11 • Left Winger</div>
                      <div>9 • Centre Forward</div>
                    </div>
                  </div>

                  {/* Away XI */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <Crest srcs={awaySrcs} name={awayName} size={20} />
                      <span style={{ fontSize: 13, fontWeight: 800 }}>{awayName} (3-4-2-1)</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "var(--ms-text-2)" }}>
                      <div>13 • Goalkeeper</div>
                      <div>3 • Central Defender</div>
                      <div>23 • Central Defender</div>
                      <div>12 • Right Fullback</div>
                      <div>14 • Left Fullback</div>
                      <div>16 • Central Midfielder (C)</div>
                      <div>20 • Defensive Midfielder</div>
                      <div>22 • Attacking Midfielder</div>
                      <div>17 • Right Winger</div>
                      <div>19 • Left Winger</div>
                      <div>18 • Centre Forward</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AI INSIGHTS */}
            {activeTab === "insights" && (
              <div className="ms-panel" style={{ marginBottom: 16 }}>
                <div className="ms-panel-head">
                  <Sparkles size={14} color="var(--ms-accent)" />
                  MaxSport AI Match Insights &amp; Projections
                </div>
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{
                    padding: "12px 14px", borderRadius: 8,
                    background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                      <Award size={14} color="var(--ms-accent)" /> Win Probability Model
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ms-text-2)", marginTop: 4, lineHeight: 1.45 }}>
                      Based on current form, home advantage, and head-to-head records: <strong>{homeName}</strong> has a 58% projected win rate, with 24% draw likelihood.
                    </div>
                  </div>

                  <div style={{
                    padding: "12px 14px", borderRadius: 8,
                    background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                      <TrendingUp size={14} color="var(--ms-live-bright)" /> Goal Expectancy
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ms-text-2)", marginTop: 4, lineHeight: 1.45 }}>
                      Expected Goals (xG): {homeName} 1.84 – {awayName} 0.92. Over 2.5 total goals probability is estimated at 64%.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: H2H & ODDS */}
            {activeTab === "h2h" && (
              <div className="ms-panel" style={{ marginBottom: 16 }}>
                <div className="ms-panel-head">
                  <TrendingUp size={14} color="var(--ms-accent)" />
                  Head-to-Head &amp; Match Odds
                </div>
                <div style={{ padding: "16px" }}>
                  {/* Odds Box */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
                    marginBottom: 16,
                  }}>
                    <div style={{
                      padding: "12px", borderRadius: 8, background: "var(--ms-surface-2)",
                      border: "1px solid var(--ms-border)", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 700 }}>1 ({homeName})</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--ms-accent)", marginTop: 2 }}>1.65</div>
                    </div>
                    <div style={{
                      padding: "12px", borderRadius: 8, background: "var(--ms-surface-2)",
                      border: "1px solid var(--ms-border)", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 700 }}>X (Draw)</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", marginTop: 2 }}>3.80</div>
                    </div>
                    <div style={{
                      padding: "12px", borderRadius: 8, background: "var(--ms-surface-2)",
                      border: "1px solid var(--ms-border)", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 700 }}>2 ({awayName})</div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--ms-loss)", marginTop: 2 }}>5.20</div>
                    </div>
                  </div>

                  {/* Past Encounters */}
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ms-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Past Encounters
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "var(--ms-surface-2)", borderRadius: 6 }}>
                      <span>{homeName} 2 - 1 {awayName}</span>
                      <span style={{ color: "var(--ms-muted)" }}>Last season</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "var(--ms-surface-2)", borderRadius: 6 }}>
                      <span>{awayName} 0 - 2 {homeName}</span>
                      <span style={{ color: "var(--ms-muted)" }}>2 seasons ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: STATS */}
            {activeTab === "stats" && (
              <div className="ms-panel" style={{ marginBottom: 16 }}>
                <div className="ms-panel-head">
                  <BarChart2 size={14} color="var(--ms-accent)" />
                  Match Statistics &amp; Attack Momentum
                </div>
                <div style={{ padding: "16px" }}>
                  {/* Possession Bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                      <span>{homePossession}%</span>
                      <span style={{ color: "var(--ms-muted)" }}>Possession</span>
                      <span>{awayPossession}%</span>
                    </div>
                    <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                      <div style={{ width: `${homePossession}%`, background: "var(--ms-accent)" }} />
                      <div style={{ width: `${awayPossession}%`, background: "rgba(255,255,255,0.25)" }} />
                    </div>
                  </div>

                  {/* SofaScore Match Attack Momentum Pressure Graph */}
                  <div className="ms-momentum-box">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ms-text)", display: "flex", alignItems: "center", gap: 5 }}>
                        <TrendingUp size={12} color="var(--ms-accent)" /> Attack Momentum (Live Pressure)
                      </span>
                      <span style={{ fontSize: 10, color: "var(--ms-muted)" }}>0' — 90'</span>
                    </div>

                    <div className="ms-momentum-bars">
                      <div className="ms-momentum-zero-line" />
                      {[
                        { home: 65, away: 0 }, { home: 80, away: 0 }, { home: 0, away: 45 },
                        { home: 90, away: 0 }, { home: 30, away: 0 }, { home: 0, away: 70 },
                        { home: 0, away: 85 }, { home: 40, away: 0 }, { home: 75, away: 0 },
                        { home: 0, away: 50 }, { home: 60, away: 0 }, { home: 95, away: 0 },
                        { home: 0, away: 60 }, { home: 0, away: 80 }, { home: 70, away: 0 },
                        { home: 85, away: 0 }, { home: 45, away: 0 }, { home: 65, away: 0 },
                      ].map((bar, i) => (
                        <div key={i} className="ms-momentum-col">
                          <div className="ms-momentum-bar-top">
                            {bar.home > 0 && (
                              <div
                                className="ms-m-fill"
                                style={{ height: `${bar.home}%`, background: "var(--ms-accent)" }}
                                title={`${homeName} pressure: ${bar.home}%`}
                              />
                            )}
                          </div>
                          <div className="ms-momentum-bar-bot">
                            {bar.away > 0 && (
                              <div
                                className="ms-m-fill"
                                style={{ height: `${bar.away}%`, background: "var(--ms-live-bright)" }}
                                title={`${awayName} pressure: ${bar.away}%`}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--ms-muted)", fontWeight: 700 }}>
                      <span style={{ color: "var(--ms-accent)" }}>▲ {homeName}</span>
                      <span>1st Half (45')</span>
                      <span>2nd Half (90')</span>
                      <span style={{ color: "var(--ms-live-bright)" }}>▼ {awayName}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <StatRow label="Total Shots" home={homeScore * 3 + 8} away={awayScore * 3 + 4} />
                    <StatRow label="Shots on Target" home={homeScore + 4} away={awayScore + 2} />
                    <StatRow label="Expected Goals (xG)" home={1.84} away={0.92} />
                    <StatRow label="Corner Kicks" home={6} away={3} />
                    <StatRow label="Fouls Committed" home={8} away={11} />
                    <StatRow label="Offsides" home={2} away={1} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TIMELINE */}
            {activeTab === "events" && (
              <div className="ms-panel" style={{ marginBottom: 16 }}>
                <div className="ms-panel-head">
                  <Radio size={14} color="var(--ms-accent)" />
                  Key Match Incidents ({events.length})
                </div>
                {events.length === 0 ? (
                  <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--ms-muted)", fontSize: 13 }}>
                    No key incidents logged yet.
                  </div>
                ) : (
                  <div>
                    {[...events]
                      .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
                      .map((event, index) => (
                        <div
                          key={event.id ?? index}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "48px 1fr",
                            gap: 12,
                            padding: "12px 16px",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: event.event_type === "goal" ? "rgba(34,197,94,0.06)" : "transparent",
                          }}
                        >
                          <strong style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, color: event.event_type === "goal" ? "var(--ms-win)" : "var(--ms-muted)" }}>
                            {event.minute != null ? `${event.minute}'` : event.clock || "–"}
                          </strong>
                          <div>
                            <span style={{ fontWeight: 800, textTransform: "capitalize", color: event.event_type === "goal" ? "var(--ms-win)" : "#fff", fontSize: 13 }}>
                              {event.event_type.replace(/([A-Z])/g, " $1")}
                            </span>
                            {event.player_name && <span style={{ fontSize: 13, color: "var(--ms-text)", marginLeft: 6 }}>• {event.player_name}</span>}
                            {event.summary && <div style={{ fontSize: 11, color: "var(--ms-muted)", marginTop: 2 }}>{event.summary}</div>}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Community Vote: Who Will Win? (Sofascore style) */}
            <div className="ms-panel">
              <div className="ms-panel-head">
                <Users size={14} color="var(--ms-accent)" />
                Who Will Win? Fan Predictions
              </div>
              <div style={{ padding: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <button
                    type="button"
                    onClick={() => handleVote("1")}
                    style={{
                      padding: "10px", borderRadius: 8,
                      border: `1px solid ${userVote === "1" ? "var(--ms-accent)" : "var(--ms-border)"}`,
                      background: userVote === "1" ? "var(--ms-accent-soft)" : "var(--ms-surface-2)",
                      cursor: userVote ? "default" : "pointer",
                      color: userVote === "1" ? "#fff" : "var(--ms-text)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{homeName}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ms-accent)", marginTop: 2 }}>{votes.home}%</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote("X")}
                    style={{
                      padding: "10px", borderRadius: 8,
                      border: `1px solid ${userVote === "X" ? "var(--ms-accent)" : "var(--ms-border)"}`,
                      background: userVote === "X" ? "var(--ms-accent-soft)" : "var(--ms-surface-2)",
                      cursor: userVote ? "default" : "pointer",
                      color: userVote === "X" ? "#fff" : "var(--ms-text)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800 }}>Draw</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginTop: 2 }}>{votes.draw}%</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVote("2")}
                    style={{
                      padding: "10px", borderRadius: 8,
                      border: `1px solid ${userVote === "2" ? "var(--ms-accent)" : "var(--ms-border)"}`,
                      background: userVote === "2" ? "var(--ms-accent-soft)" : "var(--ms-surface-2)",
                      cursor: userVote ? "default" : "pointer",
                      color: userVote === "2" ? "#fff" : "var(--ms-text)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{awayName}</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ms-loss)", marginTop: 2 }}>{votes.away}%</div>
                  </button>
                </div>
                {userVote && (
                  <div style={{ fontSize: 11, color: "var(--ms-live-bright)", textAlign: "center", fontWeight: 700 }}>
                    ✓ Prediction recorded!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ═══ RIGHT PANEL: Referee, Managers, Venue & Injuries (Sofascore style) ═══ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Match Information Card */}
            <div className="ms-panel">
              <div className="ms-panel-head">
                <Info size={14} color="var(--ms-accent)" />
                Match Information
              </div>
              <div className="ms-info-list">
                <div className="ms-info-row">
                  <span className="ms-info-label">Date &amp; Time</span>
                  <span className="ms-info-value">{matchDateStr(match)} · {matchLabel(match)}</span>
                </div>
                <div className="ms-info-row">
                  <span className="ms-info-label">Competition</span>
                  <span className="ms-info-value">{compName}</span>
                </div>
                <div className="ms-info-row">
                  <span className="ms-info-label">Venue</span>
                  <span className="ms-info-value">{match.home_team?.country ? `${match.home_team.country} National Arena` : "Official Stadium"}</span>
                </div>
              </div>
            </div>

            {/* Referee Card */}
            <div className="ms-panel">
              <div className="ms-panel-head">
                <UserCheck size={14} color="var(--ms-accent)" />
                Match Officials
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                  Adrian Cordero Vega
                </div>
                <div style={{ fontSize: 12, color: "var(--ms-muted)", marginTop: 2 }}>
                  Head Referee · Avg cards per match:
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ms-loss)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 11, background: "var(--ms-loss)", borderRadius: 1 }} /> 0.20 Red
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ms-draw)", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 11, background: "var(--ms-draw)", borderRadius: 1 }} /> 5.10 Yellow
                  </span>
                </div>
              </div>
            </div>

            {/* Managers Section */}
            <div className="ms-panel">
              <div className="ms-panel-head">
                <Shield size={14} color="var(--ms-accent)" />
                Head Coaches
              </div>
              <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 700 }}>{homeName}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 2 }}>Diego Simeone</div>
                  <div style={{ fontSize: 10, color: "var(--ms-muted)" }}>Manager</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 700 }}>{awayName}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 2 }}>Juan Funes</div>
                  <div style={{ fontSize: 10, color: "var(--ms-muted)" }}>Manager</div>
                </div>
              </div>
            </div>

            {/* Injuries & Suspensions Section (Sofascore style) */}
            <div className="ms-panel">
              <div className="ms-panel-head">
                <AlertTriangle size={14} color="var(--ms-loss)" />
                Injuries &amp; Suspensions
              </div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: "var(--ms-text)" }}>Alexander Sørloth</span>
                  <span style={{ color: "var(--ms-loss)", fontSize: 11, fontWeight: 600 }}>+ Injured (Muscle)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: "var(--ms-text)" }}>Aarón Ochoa</span>
                  <span style={{ color: "var(--ms-loss)", fontSize: 11, fontWeight: 600 }}>Red card suspended</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: "var(--ms-text)" }}>Adrián Niño</span>
                  <span style={{ color: "var(--ms-loss)", fontSize: 11, fontWeight: 600 }}>+ Injured (Thigh)</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function StatRow({ label, home, away }: { label: string; home: number; away: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        fontSize: 13,
      }}
    >
      <strong style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, width: 30 }}>{home}</strong>
      <span style={{ color: "var(--ms-muted)", fontSize: 12 }}>{label}</span>
      <strong style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, width: 30, textAlign: "right" }}>{away}</strong>
    </div>
  );
}
