import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import type { Screen } from "./types";
import { getCompetitions, getMatches, type ApiCompetition, type ApiMatch } from "./api";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props { setActiveScreen: (screen: Screen) => void; onOpenMatch: (id: number) => void; onOpenCompetition: (slug: string) => void; onOpenTeam: (slug: string) => void; }

export function SearchPage({ setActiveScreen, onOpenMatch, onOpenCompetition, onOpenTeam }: Props) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => {
    setLoading(true); setError(false);
    Promise.all([getMatches({ limit: 300 }), getCompetitions()]).then(([allMatches, allCompetitions]) => { setMatches(allMatches); setCompetitions(allCompetitions); }).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const term = query.trim().toLowerCase();
  const matchResults = useMemo(() => !term ? [] : matches.filter((match) => [match.home_team?.name, match.away_team?.name, match.competition?.name, match.league].some((value) => value?.toLowerCase().includes(term))).slice(0, 20), [matches, term]);
  const competitionResults = useMemo(() => !term ? [] : competitions.filter((competition) => competition.name.toLowerCase().includes(term)).slice(0, 12), [competitions, term]);
  const teams = useMemo(() => {
    if (!term) return [];
    const found = new Map<string, NonNullable<ApiMatch["home_team"]>>();
    matches.forEach((match) => [match.home_team, match.away_team].forEach((team) => { if (team && team.name.toLowerCase().includes(term)) found.set(team.slug || team.name, team); }));
    return [...found.values()].slice(0, 12);
  }, [matches, term]);

  return <div style={{ minHeight: "100%", paddingBottom: 32 }}>
    <PageHeader title="Search" onBack={() => setActiveScreen("home")} onRefresh={load} />
    <div style={{ padding: "8px 20px 0" }}><label style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 10, background: "#12121a", border: "1px solid rgba(255,255,255,0.08)" }}><SearchIcon size={18} color="#8b8b9a" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search matches, teams, or competitions" style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "#ececf1", fontSize: 14 }} /></label></div>
    {loading ? <EmptyState title="Loading searchable football data…" /> : error ? <ErrorState message="Could not load search data." onRetry={load} /> : !term ? <EmptyState title="Search the matches and competitions we currently have." detail="Team names are available from match data; team profiles and player records will appear when the API supports them." /> : <div style={{ padding: "18px 20px" }}>
      <ResultSection title="Matches" empty="No matching matches." >{matchResults.map((match) => <button key={match.id} type="button" onClick={() => onOpenMatch(match.id)} style={resultButton}><Crest src={match.home_team?.logo_url} name={match.home_team?.name} abbr={match.home_team?.abbr} size={26} /><span style={{ flex: 1, textAlign: "left", minWidth: 0 }}><strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{match.home_team?.name || "TBD"} vs {match.away_team?.name || "TBD"}</strong><small style={{ color: "#8b8b9a" }}>{match.competition?.name || match.league || "Football"}</small></span><strong style={{ fontVariantNumeric: "tabular-nums" }}>{match.home_score}–{match.away_score}</strong><small style={{ color: match.status === "live" ? "#dc2626" : "#8b8b9a", fontWeight: 800 }}>{match.status === "live" ? `${match.minute ?? ""}'` : match.status === "finished" ? "FT" : "Scheduled"}</small></button>)}</ResultSection>
      <ResultSection title="Competitions" empty="No matching competitions." >{competitionResults.map((competition) => <button key={competition.slug} type="button" onClick={() => onOpenCompetition(competition.slug)} style={resultButton}><Crest src={competition.logo_url} name={competition.name} size={26} /><span style={{ flex: 1, textAlign: "left" }}><strong style={{ display: "block" }}>{competition.name}</strong><small style={{ color: "#8b8b9a" }}>{competition.current_season || "View standings"}</small></span></button>)}</ResultSection>
      <ResultSection title="Teams in available fixtures" empty="No matching teams in the current fixture data." >{teams.map((team) => <button key={team.slug || team.name} type="button" onClick={() => team.slug && onOpenTeam(team.slug)} style={resultButton}><Crest src={team.logo_url} name={team.name} abbr={team.abbr} size={26} /><span style={{ flex: 1, textAlign: "left" }}><strong style={{ display: "block" }}>{team.name}</strong><small style={{ color: "#8b8b9a" }}>Open team page</small></span></button>)}</ResultSection>
    </div>}
  </div>;
}

const resultButton: React.CSSProperties = { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.07)", background: "#12121a", color: "#ececf1", marginBottom: 6, cursor: "pointer", fontSize: 13 };

function ResultSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return <section style={{ marginBottom: 20 }}><h2 style={{ fontSize: 12, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8b8b9a", margin: "0 0 9px" }}>{title}</h2>{children.length ? children : <p style={{ margin: 0, color: "#8b8b9a", fontSize: 13 }}>{empty}</p>}</section>;
}
