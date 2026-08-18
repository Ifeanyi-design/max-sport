import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getTeam, toFixtureCard, teamLogoSources, competitionLogoSources, type ApiTeamDetail, type FixtureCard } from "./api";
import { Crest } from "./Crest";
import { FlagIcon } from "./FlagIcon";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props {
  slug: string;
  onBack: () => void;
  onOpenMatch: (id: number) => void;
  onOpenCompetition: (slug: string) => void;
}

function isLiveStatus(s: string) {
  const u = (s || "").toUpperCase();
  return u === "LIVE" || u === "HT" || /^\d+$/.test(u);
}

function FormDot({ result }: { result: "W" | "D" | "L" }) {
  const cls = `ms-form-v2-dot ms-form-v2-${result}`;
  return <span className={cls}>{result}</span>;
}

export function TeamProfilePage({ slug, onBack, onOpenMatch, onOpenCompetition }: Props) {
  const [detail, setDetail] = useState<ApiTeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [matchFilter, setMatchFilter] = useState<"all" | "upcoming" | "results">("all");

  const load = () => {
    setLoading(true);
    setError(false);
    getTeam(slug)
      .then(setDetail)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, [slug]);

  if (loading) return <EmptyState title="Loading team profile…" />;
  if (error || !detail) return <ErrorState message="Could not load this team." onRetry={load} />;

  const teamSrcs = teamLogoSources({
    logo_url: detail.team.logo_url,
    provider_team_id: detail.team.provider_team_id,
    provider_name: detail.team.provider_name,
    name: detail.team.name,
  });

  // Derive form from recent matches (W/D/L)
  const recentResults: ("W" | "D" | "L")[] = detail.recent_matches
    .slice(0, 5)
    .map((m): "W" | "D" | "L" => {
      const fc = toFixtureCard(m);
      const isHome = fc.home.toLowerCase() === detail.team.name.toLowerCase();
      const hs = fc.hs ?? 0;
      const as_ = fc.as ?? 0;
      if ((fc.status || "").toUpperCase() !== "FT") return "D";
      if (isHome) return hs > as_ ? "W" : hs < as_ ? "L" : "D";
      return as_ > hs ? "W" : as_ < hs ? "L" : "D";
    });

  // Position from first standing row
  const topStanding = detail.standings?.[0];

  // All matches for right panel
  const allMatches: FixtureCard[] = [
    ...detail.upcoming_matches.map(toFixtureCard),
    ...detail.recent_matches.map(toFixtureCard),
  ].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const filteredMatches = allMatches.filter((m) => {
    if (matchFilter === "upcoming") return m.status === "scheduled" || m.status === "upcoming";
    if (matchFilter === "results") return (m.status || "").toUpperCase() === "FT" || isLiveStatus(m.status);
    return true;
  });

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      <PageHeader title={detail.team.name} onBack={onBack} onRefresh={load} />

      {/* ── Camel.tv hero: crest + name + pos + form ── */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{
          background: "var(--ms-surface)",
          border: "1px solid var(--ms-border)",
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Action background overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/match_action.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          />
          {/* Top strip with gradient */}
          <div style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.02) 100%)",
            padding: "24px 20px 20px",
            display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
            position: "relative", zIndex: 2,
          }}>
            {/* Large crest */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 8px 30px rgba(0,0,0,0.5), 0 0 0 3px rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}>
              <Crest
                srcs={teamSrcs}
                name={detail.team.name}
                abbr={detail.team.abbr}
                size={64}
                radius={0}
                country={detail.team.country}
              />
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                margin: "0 0 4px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(22px, 4vw, 32px)",
                fontWeight: 900, color: "#fff", lineHeight: 1.1,
              }}>
                {detail.team.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {detail.team.country && (
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--ms-muted)" }}>
                    <FlagIcon country={detail.team.country} size={14} />
                    {detail.team.country}
                  </span>
                )}
                {topStanding && (
                  <span style={{
                    background: "var(--ms-accent-soft)",
                    border: "1px solid var(--ms-border-accent)",
                    color: "var(--ms-accent)",
                    padding: "2px 9px", borderRadius: 999,
                    fontSize: 12, fontWeight: 700,
                  }}>
                    Pos {topStanding.position}
                  </span>
                )}
              </div>
            </div>

            {/* Form dots + W/D/L */}
            {recentResults.length > 0 && (
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--ms-muted)", fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Last {recentResults.length} Matches
                </div>
                <div className="ms-form-v2">
                  {recentResults.map((r, i) => <FormDot key={i} result={r} />)}
                </div>
                <div style={{ marginTop: 5, fontSize: 11, color: "var(--ms-muted)" }}>
                  {recentResults.filter(r => r === "W").length}W ·{" "}
                  {recentResults.filter(r => r === "D").length}D ·{" "}
                  {recentResults.filter(r => r === "L").length}L
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column: Standings left | Matches right ── */}
      <div style={{ padding: "0 16px" }}>
        <div className="ms-two-col">

          {/* LEFT: Standings in each competition */}
          <div className="ms-panel">
            <div className="ms-panel-head">Standings</div>
            {!detail.standings || detail.standings.length === 0 ? (
              <EmptyState title="No standings data." detail="Join a competition to see standings." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {detail.standings.map((row, idx) => {
                  const compSrcs = competitionLogoSources({
                    slug: row.competition.slug,
                    name: row.competition.name,
                    logo_url: row.competition.logo_url,
                    provider_competition_id: row.competition.provider_competition_id,
                    provider_name: row.competition.provider_name,
                  });
                  return (
                    <button
                      key={`${row.competition.slug}-${row.position}-${idx}`}
                      type="button"
                      onClick={() => onOpenCompetition(row.competition.slug)}
                      style={{
                        display: "flex", alignItems: "center", gap: 11,
                        padding: "12px 14px",
                        background: "transparent", border: "none", cursor: "pointer",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        textAlign: "left", width: "100%",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                    >
                      <Crest srcs={compSrcs} name={row.competition.name} size={28} style={{ borderRadius: 4, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ms-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.competition.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ms-muted)", marginTop: 2 }}>
                          {row.played}P · W{row.won} D{row.drawn} L{row.lost} · {row.points}pts
                        </div>
                      </div>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 22, fontWeight: 900, color: "var(--ms-accent)",
                      }}>
                        #{row.position}
                      </span>
                      <ChevronRight size={13} color="var(--ms-faint)" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Matches */}
          <div className="ms-panel">
            <div className="ms-panel-head" style={{ flexWrap: "wrap", gap: 4 }}>
              Matches
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                {(["all", "upcoming", "results"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMatchFilter(t)}
                    style={{
                      padding: "3px 9px", borderRadius: 5, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700,
                      background: matchFilter === t ? "var(--ms-accent)" : "rgba(255,255,255,0.07)",
                      color: matchFilter === t ? "#fff" : "var(--ms-muted)",
                      fontFamily: "'Inter', sans-serif",
                      transition: "background 0.14s",
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filteredMatches.length === 0 ? (
              <EmptyState title="No matches found." detail="Try a different filter." />
            ) : (
              <div>
                {filteredMatches.slice(0, 15).map((m) => {
                  const live = isLiveStatus(m.status);
                  const isFt = (m.status || "").toUpperCase() === "FT";
                  const homeWin = isFt && (m.hs ?? 0) > (m.as ?? 0);
                  const awayWin = isFt && (m.as ?? 0) > (m.hs ?? 0);
                  const homeSrcs = teamLogoSources({ logo_url: m.homeLogo, provider_team_id: m.homeProviderId, provider_name: m.homeProviderName, name: m.home });
                  const awaySrcs = teamLogoSources({ logo_url: m.awayLogo, provider_team_id: m.awayProviderId, provider_name: m.awayProviderName, name: m.away });

                  return (
                    <div
                      key={m.id}
                      className={`ms-compact-match${live ? " is-live" : ""}`}
                      onClick={() => onOpenMatch(m.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && onOpenMatch(m.id)}
                    >
                      <div className="ms-compact-time">
                        {live ? (
                          <span className="ms-compact-time-min">{m.min || "LIVE"}</span>
                        ) : isFt ? (
                          <span style={{ fontSize: 11, color: "var(--ms-muted)", fontWeight: 700 }}>FT</span>
                        ) : (
                          <>
                            <span className="ms-compact-time-date">{m.date?.slice(5)}</span>
                            <span className="ms-compact-time-val">{m.time}</span>
                          </>
                        )}
                      </div>
                      <div className="ms-compact-teams">
                        <div className={`ms-compact-team${homeWin ? " winner" : ""}`}>
                          <Crest srcs={homeSrcs} name={m.home} size={15} style={{ flexShrink: 0 }} />
                          <span>{m.home}</span>
                        </div>
                        <div className={`ms-compact-team${awayWin ? " winner" : ""}`}>
                          <Crest srcs={awaySrcs} name={m.away} size={15} style={{ flexShrink: 0 }} />
                          <span>{m.away}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 36 }}>
                        {m.hs != null ? (
                          <>
                            <span className="ms-compact-score">{m.hs}</span>
                            <span className="ms-compact-score">{m.as}</span>
                          </>
                        ) : (
                          <ChevronRight size={14} color="var(--ms-faint)" />
                        )}
                        {live && (
                          <span className="ms-live-badge" style={{ fontSize: 9, padding: "2px 5px" }}>LIVE</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
