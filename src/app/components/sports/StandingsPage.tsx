import { useEffect, useState } from "react";
import { CalendarDays, Info } from "lucide-react";
import {
  getCompetitions, getMatches, getStandings, toFixtureCard, toStandingRow,
  competitionLogoSources, teamLogoSources,
  type ApiCompetition, type FixtureCard, type StandingRow
} from "./api";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { MatchRow } from "./MatchRow";

interface Props {
  slug: string;
  onBack: () => void;
  onSelectCompetition: (slug: string) => void;
  onOpenMatch: (id: number) => void;
}

const ZONE_CONFIG = [
  { zone: "champions" as const, label: "UEFA Champions League", color: "var(--ms-champ)" },
  { zone: "europa" as const, label: "UEFA Europa League", color: "var(--ms-europa)" },
  { zone: "relegation" as const, label: "Relegation", color: "var(--ms-releg)" },
];

export function StandingsPage({ slug, onBack, onSelectCompetition, onOpenMatch }: Props) {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [competition, setCompetition] = useState<ApiCompetition | null>(null);
  const [allCompetitions, setAllCompetitions] = useState<ApiCompetition[]>([]);
  const [fixtures, setFixtures] = useState<FixtureCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true); setError(null);
    Promise.all([
      getCompetitions(),
      getStandings(slug),
      getMatches({ competition: slug, limit: 60 }),
    ]).then(([competitions, standings, matches]) => {
      setAllCompetitions(competitions);
      setCompetition(competitions.find(c => c.slug === slug) ?? null);
      setRows(standings.map(toStandingRow));
      setFixtures(matches.map(toFixtureCard));
    }).catch(err => setError(String(err?.message || err))).finally(() => setLoading(false));
  };
  useEffect(load, [slug]);

  const activeComp = competition;
  const compLogoSrcs = activeComp
    ? competitionLogoSources({
        logo_url: activeComp.logo_url,
        provider_competition_id: activeComp.provider_competition_id,
        provider_name: activeComp.provider_name,
      })
    : [];

  // Which zones are present in this table?
  const zonesPresent = new Set(rows.map(r => r.zone).filter(z => z !== "normal"));

  return (
    <div style={{ minHeight: "100%", paddingBottom: 40 }}>
      <PageHeader title={competition?.name || "Standings"} onBack={onBack} onRefresh={load} />

      {/* Competition selector pills */}
      <div className="ms-scroll ms-filter-strip" style={{ paddingBottom: 14 }}>
        {allCompetitions.map(c => {
          const active = c.slug === slug;
          const srcs = competitionLogoSources({
            logo_url: c.logo_url,
            provider_competition_id: c.provider_competition_id,
            provider_name: c.provider_name,
          });
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => onSelectCompetition(c.slug)}
              className={`ms-pill${active ? " is-active" : ""}`}
              style={{ fontSize: 11 }}
            >
              <Crest src={srcs[0]} fallbackSrcs={srcs.slice(1)} name={c.name} size={16} radius={4} />
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Active competition banner */}
      {activeComp && (
        <div className="ms-card" style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 14px 16px", padding: "14px 16px" }}>
          <Crest
            src={compLogoSrcs[0]}
            fallbackSrcs={compLogoSrcs.slice(1)}
            name={activeComp.name} size={42} radius={8}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{activeComp.name}</div>
            {activeComp.country && (
              <div style={{ fontSize: 12, color: "var(--ms-muted)", marginTop: 2 }}>{activeComp.country}</div>
            )}
            <div style={{ fontSize: 11, color: "var(--ms-faint)", marginTop: 2 }}>
              {activeComp.current_season ? `Season ${activeComp.current_season}` : "Current table"}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 14px" }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="ms-skeleton" style={{ height: 42, borderRadius: 8 }} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message="Could not load standings for this competition." onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState title="No standings available yet." detail="Check back later or choose another competition." />
      ) : (
        <div style={{ margin: "0 14px" }}>
          <div className="ms-table">
            <div className="ms-table-inner">
              {/* Header */}
              <div className="ms-table-head" style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--ms-surface)" }}>
                <span>#</span>
                <span>Team</span>
                <span title="Played">P</span>
                <span title="Won">W</span>
                <span title="Drawn">D</span>
                <span title="Lost">L</span>
                <span title="Goal Difference">GD</span>
                <span title="Points" style={{ fontWeight: 900, color: "var(--ms-text)" }}>PTS</span>
              </div>

              {rows.map(row => {
                const zoneClass =
                  row.zone === "champions" ? "ms-zone-champ" :
                  row.zone === "europa" ? "ms-zone-europa" :
                  row.zone === "relegation" ? "ms-zone-releg" : "";
                const posClass =
                  row.zone === "champions" ? "ms-pos-top" :
                  row.zone === "relegation" ? "ms-pos-releg" : "ms-pos";
                const teamSrcs = teamLogoSources({
                  logo_url: row.logo,
                  provider_team_id: (row as any).provider_team_id,
                  provider_name: (row as any).provider_name,
                });

                return (
                  <div key={row.pos} className={`ms-table-row ${zoneClass}`}>
                    <span className={posClass}>{row.pos}</span>
                    <span className="ms-team-cell">
                      <Crest
                        src={teamSrcs[0]}
                        fallbackSrcs={teamSrcs.slice(1)}
                        name={row.team} abbr={row.abbr} size={22}
                      />
                      <span>{row.team}</span>
                    </span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-text-2)" }}>{row.p}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-win)" }}>{row.w}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-draw)" }}>{row.d}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ms-loss)" }}>{row.l}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: row.gd > 0 ? "var(--ms-win)" : row.gd < 0 ? "var(--ms-loss)" : "var(--ms-muted)" }}>
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
                {ZONE_CONFIG.filter(z => zonesPresent.has(z.zone)).map(z => (
                  <div key={z.zone} className="ms-zone-legend-item">
                    <span className="ms-zone-legend-dot" style={{ background: z.color }} />
                    {z.label}
                  </div>
                ))}
                <div className="ms-zone-legend-item" style={{ marginLeft: "auto" }}>
                  <Info size={11} />
                  <span style={{ fontSize: 10 }}>Positions may update live</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixtures for this competition */}
      {!loading && !error && fixtures.length > 0 && (
        <section style={{ margin: "24px 14px 0" }}>
          <h2 style={{
            margin: "0 0 12px", fontSize: 17,
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800
          }}>
            Fixtures &amp; Results
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {fixtures.slice(0, 12).map(f => (
              <MatchRow key={f.id} match={f} onClick={() => onOpenMatch(f.id)} />
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20, color: "var(--ms-faint)", fontSize: 11 }}>
        <CalendarDays size={12} />
        Tables supplied by MaxCinema sports data feed
      </div>
    </div>
  );
}
