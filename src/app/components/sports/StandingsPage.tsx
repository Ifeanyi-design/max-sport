import { useEffect, useState } from "react";
import { Info, CalendarDays, ChevronRight } from "lucide-react";
import {
  getCompetitions, getMatches, getStandings, toFixtureCard, toStandingRow,
  competitionLogoSources, teamLogoSources,
  type ApiCompetition, type FixtureCard, type StandingRow,
} from "./api";
import { Crest } from "./Crest";
import { FlagIcon } from "./FlagIcon";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props {
  slug: string;
  onBack: () => void;
  onSelectCompetition: (slug: string) => void;
  onOpenMatch: (id: number) => void;
}

const ZONE_CONFIG = [
  { zone: "champions" as const, label: "UEFA Champions League", color: "var(--ms-champ)" },
  { zone: "europa" as const, label: "UEFA Europa League", color: "var(--ms-europa)" },
  { zone: "relegation" as const, label: "Relegation Zone", color: "var(--ms-releg)" },
];

function isLiveStatus(s: string) {
  const u = (s || "").toUpperCase();
  return u === "LIVE" || u === "HT" || /^\d+$/.test(u);
}

export function StandingsPage({ slug, onBack, onSelectCompetition, onOpenMatch }: Props) {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [competition, setCompetition] = useState<ApiCompetition | null>(null);
  const [allCompetitions, setAllCompetitions] = useState<ApiCompetition[]>([]);
  const [fixtures, setFixtures] = useState<FixtureCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchTab, setMatchTab] = useState<"all" | "upcoming" | "results">("all");

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getCompetitions(),
      getStandings(slug),
      getMatches({ competition: slug, limit: 60 }),
    ])
      .then(([competitions, standings, matches]) => {
        setAllCompetitions(competitions);
        setCompetition(competitions.find((c) => c.slug === slug) ?? null);
        setRows(standings.map(toStandingRow));
        setFixtures(matches.map(toFixtureCard));
      })
      .catch((err) => setError(String(err?.message || err)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [slug]);

  const activeComp = competition;
  const compLogoSrcs = activeComp
    ? competitionLogoSources({
        slug: activeComp.slug, name: activeComp.name, logo_url: activeComp.logo_url,
        provider_competition_id: activeComp.provider_competition_id, provider_name: activeComp.provider_name,
      })
    : [];

  const zonesPresent = new Set(rows.map((r) => r.zone).filter((z) => z !== "normal"));

  const filteredFixtures = fixtures.filter((f) => {
    if (matchTab === "upcoming") return f.status === "scheduled" || f.status === "upcoming";
    if (matchTab === "results") return (f.status || "").toUpperCase() === "FT" || isLiveStatus(f.status);
    return true;
  });

  // Matchday progress: estimate from known fixtures
  const allDates = fixtures.map(f => f.date).filter(Boolean).sort();
  const firstDate = allDates[0] || "";
  const lastDate = allDates[allDates.length - 1] || "";
  const now = new Date().toISOString().slice(0, 10);
  const totalRange = firstDate && lastDate && firstDate !== lastDate
    ? new Date(lastDate).getTime() - new Date(firstDate).getTime()
    : 0;
  const elapsed = firstDate
    ? Math.max(0, new Date(now).getTime() - new Date(firstDate).getTime())
    : 0;
  const progress = totalRange > 0 ? Math.min(100, Math.round((elapsed / totalRange) * 100)) : 0;

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      <PageHeader title={competition?.name || "League Table"} onBack={onBack} onRefresh={load} />

      {/* Competition selector pills */}
      <div className="ms-scroll ms-filter-strip" style={{ padding: "8px 16px 12px" }}>
        {allCompetitions.map((c) => {
          const active = c.slug === slug;
          const srcs = competitionLogoSources({
            slug: c.slug, name: c.name, logo_url: c.logo_url,
            provider_competition_id: c.provider_competition_id, provider_name: c.provider_name,
          });
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelectCompetition(c.slug)}
              className={`ms-pill${active ? " is-active" : ""}`}
            >
              {c.country && <FlagIcon country={c.country} size={14} />}
              <Crest srcs={srcs} name={c.name} size={16} radius={3} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Camel.tv hero: centered crest + title ── */}
      {activeComp && (
        <div
          className="ms-crest-hero"
          style={{
            margin: "0 16px 16px",
            borderRadius: 12,
            border: "1px solid var(--ms-border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "url('/championship.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              opacity: 0.12,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="ms-crest-hero-circle">
              <Crest
                srcs={compLogoSrcs}
                name={activeComp.name}
                size={68}
                radius={0}
                country={activeComp.country}
              />
            </div>
            <div className="ms-crest-hero-title">{activeComp.name}</div>
            <div className="ms-crest-hero-sub" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {activeComp.country && <FlagIcon country={activeComp.country} size={14} />}
              <span>{activeComp.country || "International"}</span>
              {activeComp.current_season && <><span>·</span><span>{activeComp.current_season}</span></>}
            </div>
          </div>

          {/* Matchday progress bar */}
          {progress > 0 && (
            <div style={{ marginTop: 12, padding: "0 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ms-muted)", marginBottom: 4 }}>
                <span>{firstDate}</span>
                <span style={{ color: "var(--ms-accent)", fontWeight: 700 }}>{progress}%</span>
                <span>{lastDate}</span>
              </div>
              <div className="ms-progress">
                <div className="ms-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Two-column: Standings left | Matches right ── */}
      <div style={{ padding: "0 16px" }}>
        <div className="ms-two-col">

          {/* LEFT: Standings */}
          <div className="ms-panel">
            <div className="ms-panel-head">
              Standings
            </div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px" }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="ms-skeleton" style={{ height: 40, borderRadius: 7 }} />
                ))}
              </div>
            ) : error ? (
              <ErrorState message="Could not load standings." onRetry={load} />
            ) : rows.length === 0 ? (
              <EmptyState title="No standings yet." detail="Check back after matches are played." />
            ) : (
              <>
                <div className="ms-table-inner" style={{ overflowX: "auto" }}>
                  {/* Header */}
                  <div className="ms-table-head" style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--ms-surface-2)" }}>
                    <span>#</span>
                    <span>Club</span>
                    <span title="Played">P</span>
                    <span title="Won">W</span>
                    <span title="Drawn">D</span>
                    <span title="Lost">L</span>
                    <span title="Goal Difference">GD</span>
                    <span title="Points" style={{ fontWeight: 900, color: "var(--ms-text)" }}>PTS</span>
                  </div>

                  {rows.map((row) => {
                    const zoneClass =
                      row.zone === "champions" ? "ms-zone-champ"
                      : row.zone === "europa" ? "ms-zone-europa"
                      : row.zone === "relegation" ? "ms-zone-releg"
                      : "";
                    const posClass =
                      row.zone === "champions" ? "ms-pos-top"
                      : row.zone === "relegation" ? "ms-pos-releg"
                      : "ms-pos";
                    const teamSrcs = teamLogoSources({
                      logo_url: row.logo, provider_team_id: row.provider_team_id,
                      provider_name: row.provider_name, name: row.team,
                    });

                    return (
                      <div key={row.pos} className={`ms-table-row ${zoneClass}`}>
                        <span className={posClass}>{row.pos}</span>
                        <span className="ms-team-cell">
                          <Crest srcs={teamSrcs} name={row.team} abbr={row.abbr} size={22} />
                          <span>{row.team}</span>
                        </span>
                        <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-text-2)" }}>{row.p}</span>
                        <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-win)" }}>{row.w}</span>
                        <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-draw)" }}>{row.d}</span>
                        <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-loss)" }}>{row.l}</span>
                        <span style={{
                          fontVariantNumeric: "tabular-nums", fontWeight: 700,
                          color: row.gd > 0 ? "var(--ms-win)" : row.gd < 0 ? "var(--ms-loss)" : "var(--ms-muted)",
                        }}>
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </span>
                        <strong className="ms-pts">{row.pts}</strong>
                      </div>
                    );
                  })}
                </div>

                {/* Zone legend */}
                {zonesPresent.size > 0 && (
                  <div className="ms-zone-legend">
                    {ZONE_CONFIG.filter((z) => zonesPresent.has(z.zone)).map((z) => (
                      <div key={z.zone} className="ms-zone-legend-item">
                        <span className="ms-zone-legend-dot" style={{ background: z.color }} />
                        {z.label}
                      </div>
                    ))}
                    <div className="ms-zone-legend-item" style={{ marginLeft: "auto" }}>
                      <Info size={11} />
                      <span style={{ fontSize: 10 }}>Live data</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Matches */}
          <div className="ms-panel">
            <div className="ms-panel-head" style={{ flexWrap: "wrap", gap: 4 }}>
              <CalendarDays size={14} color="var(--ms-accent)" />
              Matches
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                {(["all", "upcoming", "results"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMatchTab(t)}
                    style={{
                      padding: "3px 9px", borderRadius: 5, border: "none", cursor: "pointer",
                      fontSize: 11, fontWeight: 700,
                      background: matchTab === t ? "var(--ms-accent)" : "rgba(255,255,255,0.07)",
                      color: matchTab === t ? "#fff" : "var(--ms-muted)",
                      fontFamily: "'Inter', sans-serif",
                      transition: "background 0.14s, color 0.14s",
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="ms-skeleton" style={{ height: 36, borderRadius: 6 }} />
                  </div>
                ))}
              </div>
            ) : filteredFixtures.length === 0 ? (
              <EmptyState title="No matches found." detail="Try a different filter." />
            ) : (
              <div>
                {filteredFixtures.slice(0, 15).map((m) => {
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
                          <span className="ms-live-badge" style={{ fontSize: 9, padding: "2px 5px" }}>
                            LIVE
                          </span>
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
