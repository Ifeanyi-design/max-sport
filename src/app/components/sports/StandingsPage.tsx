import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getCompetitions, getMatches, getStandings, toFixtureCard, toStandingRow, type ApiCompetition, type FixtureCard, type StandingRow } from "./api";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";
import { MatchRow } from "./MatchRow";

interface Props { slug: string; onBack: () => void; onSelectCompetition: (slug: string) => void; onOpenMatch: (id: number) => void; }

export function StandingsPage({ slug, onBack, onSelectCompetition, onOpenMatch }: Props) {
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [competition, setCompetition] = useState<ApiCompetition | null>(null);
  const [allCompetitions, setAllCompetitions] = useState<ApiCompetition[]>([]);
  const [fixtures, setFixtures] = useState<FixtureCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = () => {
    setLoading(true); setError(null);
    Promise.all([getCompetitions(), getStandings(slug), getMatches({ competition: slug, limit: 60 })]).then(([competitions, standings, matches]) => {
      setAllCompetitions(competitions); setCompetition(competitions.find((item) => item.slug === slug) ?? null); setRows(standings.map(toStandingRow)); setFixtures(matches.map(toFixtureCard));
    }).catch((err) => setError(String(err?.message || err))).finally(() => setLoading(false));
  };
  useEffect(load, [slug]);

  return <div style={{ minHeight: "100%", paddingBottom: 32 }}>
    <PageHeader title={competition?.name || "Standings"} onBack={onBack} onRefresh={load} />
    <div className="ms-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 20px 14px" }}>
      {allCompetitions.map((item) => <button key={item.slug} type="button" onClick={() => onSelectCompetition(item.slug)} style={{ whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 10px", borderRadius: 8, border: `1px solid ${item.slug === slug ? "rgba(200,30,30,0.55)" : "rgba(255,255,255,0.08)"}`, background: item.slug === slug ? "rgba(200,30,30,0.14)" : "#12121a", color: "#ececf1", cursor: "pointer", fontSize: 12, fontWeight: 700 }}><Crest src={item.logo_url} name={item.name} size={18} />{item.name}</button>)}
    </div>
    {competition && <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 20px 12px", padding: "12px 14px", borderRadius: 10, background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}><Crest src={competition.logo_url} name={competition.name} size={36} /><div><div style={{ fontWeight: 800 }}>{competition.name}</div><div style={{ marginTop: 3, fontSize: 12, color: "#8b8b9a" }}>{competition.current_season ? `Season ${competition.current_season}` : "Current table"}</div></div></div>}
    {loading ? <EmptyState title="Loading standings…" /> : error ? <ErrorState message="Could not load standings for this competition." onRetry={load} /> : rows.length === 0 ? <EmptyState title="No standings are available yet." /> : <div style={{ margin: "0 20px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflowX: "auto" }}>
      <div style={{ minWidth: 600 }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px minmax(190px,1fr) repeat(7,42px)", padding: "10px 12px", color: "#8b8b9a", fontSize: 11, fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.07)" }}><span>#</span><span>TEAM</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span>PTS</span></div>
        {rows.map((row) => <div key={row.pos} style={{ display: "grid", gridTemplateColumns: "36px minmax(190px,1fr) repeat(7,42px)", alignItems: "center", padding: "9px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13, borderLeft: `3px solid ${row.zone === "champions" ? "#2563eb" : row.zone === "relegation" ? "#dc2626" : "transparent"}` }}><span>{row.pos}</span><span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}><Crest src={row.logo} name={row.team} abbr={row.abbr} size={22} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 650 }}>{row.team}</span></span><span>{row.p}</span><span>{row.w}</span><span>{row.d}</span><span>{row.l}</span><span>{row.gd > 0 ? `+${row.gd}` : row.gd}</span><strong>{row.pts}</strong></div>)}
      </div>
    </div>}
    {!loading && !error && fixtures.length > 0 && <section style={{ margin: "24px 20px 0" }}>
      <h2 style={{ margin: "0 0 10px", fontSize: 15 }}>Fixtures & results</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>{fixtures.slice(0, 12).map((fixture) => <MatchRow key={fixture.id} match={fixture} onClick={() => onOpenMatch(fixture.id)} />)}</div>
    </section>}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, color: "#8b8b9a", fontSize: 12 }}><CalendarDays size={14} /> Tables are supplied by MaxCinema’s sports data feed.</div>
  </div>;
}
