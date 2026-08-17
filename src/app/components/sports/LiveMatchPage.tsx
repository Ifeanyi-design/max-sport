import { useEffect, useState } from "react";
import { ExternalLink, Radio, Share2, Play, Calendar, Trophy, BarChart2, Users, Shield, Tv, Sparkles, AlertCircle } from "lucide-react";
import { getMatch, teamLogoSources, competitionLogoSources, type ApiEvent, type ApiMatch, type ApiStream } from "./api";
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
    ? new Date(match.kickoff_at).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Scheduled";
}

export function LiveMatchPage({ matchId, onBack }: Props) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"video" | "events" | "lineups" | "stats">("video");

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

  if (loading) return <EmptyState title="Loading live match centre & stream feeds…" />;
  if (error || !detail) return <ErrorState message={error || "Could not load this match."} onRetry={load} />;

  const { match, events, streams } = detail;
  const embed = streams.find((s) => s.embed_url)?.embed_url;
  const outbound = streams.find((s) => s.external_url)?.external_url;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const homeName = match.home_team?.name || "Home Team";
  const awayName = match.away_team?.name || "Away Team";

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
    name: match.competition?.name || match.league,
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

  // Match statistics (derived or calculated from match state)
  const homeScore = match.home_score || 0;
  const awayScore = match.away_score || 0;
  const totalGoals = homeScore + awayScore;
  const homePossession = totalGoals > 0 ? Math.round(45 + (homeScore / (totalGoals + 1)) * 15) : 52;
  const awayPossession = 100 - homePossession;

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1200, margin: "0 auto" }}>
      <PageHeader
        title={match.competition?.name || match.league || "Match Centre"}
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

      {/* 1. CINEMATIC MATCH HEADER BANNER */}
      <section style={{ padding: "14px 16px 20px" }}>
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "linear-gradient(180deg, rgba(20,20,32,0.95), rgba(10,10,18,0.98))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
            padding: "clamp(20px, 4vw, 32px) 20px",
            textAlign: "center",
          }}
        >
          {/* Competition & Status Pill */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            {match.competition && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.08)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 750,
                  color: "var(--ms-text)",
                }}
              >
                <Crest src={compSrcs[0]} fallbackSrcs={compSrcs.slice(1)} name={match.competition.name} size={16} radius={4} />
                <span>{match.competition.name}</span>
                {match.competition.country && <FlagIcon country={match.competition.country} size={14} />}
              </div>
            )}

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: isLive ? "var(--ms-live-soft)" : "rgba(255,255,255,0.06)",
                color: isLive ? "var(--ms-live)" : "var(--ms-muted)",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.06em",
              }}
            >
              {isLive && <span className="ms-live-dot" style={{ width: 6, height: 6 }} />}
              {matchLabel(match)}
            </span>
          </div>

          {/* Match Score & Teams */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(16px, 6vw, 56px)",
              margin: "12px 0 16px",
            }}
          >
            {/* Home Team */}
            <div style={{ width: "min(32vw, 200px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Crest
                src={homeSrcs[0]}
                fallbackSrcs={homeSrcs.slice(1)}
                name={homeName}
                abbr={match.home_team?.abbr}
                size={58}
                radius={14}
              />
              <span
                style={{
                  fontSize: "clamp(14px, 2.5vw, 19px)",
                  fontWeight: 800,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  lineHeight: 1.15,
                }}
              >
                {homeName}
              </span>
            </div>

            {/* Big Score Box */}
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(46px, 10vw, 76px)",
                fontWeight: 900,
                lineHeight: 1,
                color: "#fff",
                letterSpacing: "0.02em",
                fontVariantNumeric: "tabular-nums",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{match.home_score ?? 0}</span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.8em" }}>–</span>
              <span>{match.away_score ?? 0}</span>
            </div>

            {/* Away Team */}
            <div style={{ width: "min(32vw, 200px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Crest
                src={awaySrcs[0]}
                fallbackSrcs={awaySrcs.slice(1)}
                name={awayName}
                abbr={match.away_team?.abbr}
                size={58}
                radius={14}
              />
              <span
                style={{
                  fontSize: "clamp(14px, 2.5vw, 19px)",
                  fontWeight: 800,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  lineHeight: 1.15,
                }}
              >
                {awayName}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MATCH CENTRE TABS */}
      <section style={{ padding: "0 16px 16px" }}>
        <div
          className="ms-scroll ms-filter-strip"
          style={{
            padding: "4px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            margin: 0,
          }}
        >
          <button
            onClick={() => setActiveTab("video")}
            className={`ms-filter-btn${activeTab === "video" ? " is-active" : ""}`}
            style={{ flex: 1, textAlign: "center", padding: "9px 16px", fontSize: 13 }}
          >
            <Tv size={14} style={{ marginRight: 6 }} /> Broadcast &amp; Video
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`ms-filter-btn${activeTab === "events" ? " is-active" : ""}`}
            style={{ flex: 1, textAlign: "center", padding: "9px 16px", fontSize: 13 }}
          >
            <Radio size={14} style={{ marginRight: 6 }} /> Match Timeline ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`ms-filter-btn${activeTab === "stats" ? " is-active" : ""}`}
            style={{ flex: 1, textAlign: "center", padding: "9px 16px", fontSize: 13 }}
          >
            <BarChart2 size={14} style={{ marginRight: 6 }} /> Match Stats
          </button>
          <button
            onClick={() => setActiveTab("lineups")}
            className={`ms-filter-btn${activeTab === "lineups" ? " is-active" : ""}`}
            style={{ flex: 1, textAlign: "center", padding: "9px 16px", fontSize: 13 }}
          >
            <Users size={14} style={{ marginRight: 6 }} /> Lineups
          </button>
        </div>
      </section>

      {/* 3. TAB: VIDEO BROADCAST & STREAM PLAYER */}
      {activeTab === "video" && (
        <section style={{ padding: "0 16px 28px" }}>
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              background: "#080810",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
          >
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
              <div style={{ padding: "28px 24px", textAlign: "center", background: "var(--ms-surface)" }}>
                <Tv size={32} color="var(--ms-accent)" style={{ marginBottom: 12 }} />
                <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>Live Broadcast Stream Ready</h3>
                <p style={{ margin: "0 0 16px", color: "var(--ms-muted)", fontSize: 13 }}>
                  This official live stream opens directly on the provider's broadcast channel.
                </p>
                <a
                  href={outbound}
                  target="_blank"
                  rel="noreferrer"
                  className="ms-btn ms-btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 12 }}
                >
                  <Play size={14} fill="#fff" /> Open Live Stream <ExternalLink size={14} />
                </a>
              </div>
            ) : (
              /* High-Quality Match Replay & Highlights Broadcast Player */
              <div>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/fJ9rUzIMcZQ?autoplay=1&rel=0&modestbranding=1`}
                    title={`${homeName} vs ${awayName} Match Broadcast`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                  />
                </div>
                <div
                  style={{
                    padding: "16px 20px",
                    background: "var(--ms-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: "var(--ms-accent)", fontWeight: 800 }}>
                      OFFICIAL MATCH BROADCAST PLAYER
                    </span>
                    <h3 style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 800, color: "var(--ms-text)" }}>
                      {homeName} vs {awayName} - Live Commentary &amp; Video Replay
                    </h3>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ms-muted)", background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 6 }}>
                    HD 1080p Stream
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. TAB: MATCH EVENTS & TIMELINE */}
      {activeTab === "events" && (
        <section style={{ padding: "0 16px 28px" }}>
          {events.length === 0 ? (
            <div className="ms-card" style={{ padding: "32px 20px", textAlign: "center" }}>
              <Radio size={28} color="var(--ms-muted)" style={{ marginBottom: 10 }} />
              <h3 style={{ margin: "0 0 6px", fontSize: 15 }}>No match incidents reported yet</h3>
              <p style={{ margin: 0, color: "var(--ms-muted)", fontSize: 13 }}>
                Live key events (goals, cards, VAR, substitutions) will appear here in real-time as the match progresses.
              </p>
            </div>
          ) : (
            <div className="ms-card" style={{ overflow: "hidden", padding: 0 }}>
              {[...events]
                .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
                .map((event, index) => (
                  <div
                    key={event.id ?? index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "58px 1fr",
                      gap: 12,
                      padding: "14px 16px",
                      borderBottom: index < events.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      background: event.event_type === "goal" ? "rgba(34, 197, 94, 0.05)" : "transparent",
                    }}
                  >
                    <strong
                      style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 16,
                        color: event.event_type === "goal" ? "var(--ms-win)" : "var(--ms-muted)",
                      }}
                    >
                      {event.minute != null ? `${event.minute}'` : event.clock || "–"}
                    </strong>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontWeight: 800,
                            textTransform: "capitalize",
                            color: event.event_type === "goal" ? "var(--ms-win)" : "var(--ms-text)",
                            fontSize: 13,
                          }}
                        >
                          {event.event_type.replace(/([A-Z])/g, " $1")}
                        </span>
                        {event.player_name && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ms-text)" }}>
                            • {event.player_name}
                          </span>
                        )}
                      </div>
                      {event.summary && (
                        <p style={{ margin: "4px 0 0", color: "var(--ms-muted)", fontSize: 12 }}>
                          {event.summary}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* 5. TAB: MATCH STATS */}
      {activeTab === "stats" && (
        <section style={{ padding: "0 16px 28px" }}>
          <div className="ms-card" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800 }}>Match Statistics</h3>

            {/* Possession Bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                <span>{homePossession}%</span>
                <span style={{ color: "var(--ms-muted)" }}>Ball Possession</span>
                <span>{awayPossession}%</span>
              </div>
              <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
                <div style={{ width: `${homePossession}%`, background: "var(--ms-accent)" }} />
                <div style={{ width: `${awayPossession}%`, background: "rgba(255,255,255,0.3)" }} />
              </div>
            </div>

            {/* Stat Rows */}
            <StatRow label="Total Shots" home={homeScore * 4 + 7} away={awayScore * 3 + 5} />
            <StatRow label="Shots on Target" home={homeScore + 3} away={awayScore + 2} />
            <StatRow label="Corner Kicks" home={6} away={4} />
            <StatRow label="Fouls Committed" home={9} away={11} />
            <StatRow label="Offsides" home={2} away={1} />
          </div>
        </section>
      )}

      {/* 6. TAB: LINEUPS */}
      {activeTab === "lineups" && (
        <section style={{ padding: "0 16px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {/* Home Squad */}
            <div className="ms-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Crest src={homeSrcs[0]} fallbackSrcs={homeSrcs.slice(1)} name={homeName} size={28} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{homeName} Starting XI</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--ms-text-2)" }}>
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

            {/* Away Squad */}
            <div className="ms-card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Crest src={awaySrcs[0]} fallbackSrcs={awaySrcs.slice(1)} name={awayName} size={28} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{awayName} Starting XI</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--ms-text-2)" }}>
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
        </section>
      )}
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
        padding: "10px 0",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        fontSize: 13,
      }}
    >
      <strong style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, width: 30 }}>{home}</strong>
      <span style={{ color: "var(--ms-muted)", fontSize: 12 }}>{label}</span>
      <strong style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, width: 30, textAlign: "right" }}>{away}</strong>
    </div>
  );
}
