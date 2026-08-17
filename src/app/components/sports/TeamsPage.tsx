import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Screen } from "./types";
import { getTeams, teamLogoSources, type ApiTeam } from "./api";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props { setActiveScreen: (screen: Screen) => void; onOpenTeam: (slug: string) => void; }

export function TeamsPage({ setActiveScreen, onOpenTeam }: Props) {
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => { setLoading(true); setError(false); getTeams({ limit: 200 }).then(setTeams).catch(() => setError(true)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const visible = useMemo(() => teams.filter((team) => team.name.toLowerCase().includes(query.trim().toLowerCase())), [teams, query]);
  return <div style={{ minHeight: "100%", paddingBottom: 32 }}>
    <PageHeader title="Teams" onBack={() => setActiveScreen("home")} onRefresh={load} />
    <div style={{ padding: "6px 20px 16px" }}><label style={{ display: "flex", alignItems: "center", gap: 9, background: "#12121a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "10px 12px" }}><Search size={16} color="#8b8b9a" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a team" style={{ flex: 1, outline: 0, border: 0, background: "transparent", color: "#ececf1", fontSize: 14 }} /></label></div>
    {loading ? <EmptyState title="Loading teams…" /> : error ? <ErrorState message="Could not load teams." onRetry={load} /> : visible.length === 0 ? <EmptyState title="No teams match your search." /> : <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 8 }}>{visible.map((team) => {
      const srcs = teamLogoSources({ logo_url: team.logo_url, provider_team_id: team.provider_team_id, provider_name: team.provider_name });
      return <button key={team.slug} type="button" onClick={() => onOpenTeam(team.slug)} style={{ display: "flex", alignItems: "center", gap: 10, textAlign: "left", padding: 11, borderRadius: 10, background: "#12121a", border: "1px solid rgba(255,255,255,0.07)", color: "#ececf1", cursor: "pointer" }}><Crest src={srcs[0]} fallbackSrcs={srcs.slice(1)} name={team.name} abbr={team.abbr} size={32} /><span style={{ minWidth: 0 }}><strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{team.name}</strong>{team.country && <small style={{ color: "#8b8b9a" }}>{team.country}</small>}</span></button>;
    })}</div>}
  </div>;
}
