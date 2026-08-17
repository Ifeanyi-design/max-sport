import { useEffect, useState } from "react";
import { getTeam, toFixtureCard, teamLogoSources, competitionLogoSources, type ApiTeamDetail } from "./api";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { MatchRow } from "./MatchRow";
import { PageHeader } from "./PageHeader";

interface Props { slug: string; onBack: () => void; onOpenMatch: (id: number) => void; onOpenCompetition: (slug: string) => void; }

export function TeamProfilePage({ slug, onBack, onOpenMatch, onOpenCompetition }: Props) {
  const [detail, setDetail] = useState<ApiTeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => { setLoading(true); setError(false); getTeam(slug).then(setDetail).catch(() => setError(true)).finally(() => setLoading(false)); };
  useEffect(load, [slug]);
  if (loading) return <EmptyState title="Loading team…" />;
  if (error || !detail) return <ErrorState message="Could not load this team." onRetry={load} />;

  const teamSrcs = teamLogoSources({ logo_url: detail.team.logo_url, provider_team_id: detail.team.provider_team_id, provider_name: detail.team.provider_name });

  return <div style={{ minHeight: "100%", paddingBottom: 32 }}>
    <PageHeader title="Team" onBack={onBack} onRefresh={load} />
    <header style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}><Crest src={teamSrcs[0]} fallbackSrcs={teamSrcs.slice(1)} name={detail.team.name} abbr={detail.team.abbr} size={58} /><div><h1 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 30 }}>{detail.team.name}</h1>{detail.team.country && <p style={{ margin: "3px 0 0", color: "#8b8b9a", fontSize: 13 }}>{detail.team.country}</p>}</div></header>
    <TeamMatches title="Upcoming" matches={detail.upcoming_matches} onOpenMatch={onOpenMatch} empty="No upcoming matches are available." />
    <TeamMatches title="Recent results" matches={detail.recent_matches} onOpenMatch={onOpenMatch} empty="No recent results are available." />
    <section style={{ margin: "24px 20px 0" }}><h2 style={{ fontSize: 15, margin: "0 0 10px" }}>League positions</h2>{detail.standings.length === 0 ? <EmptyState title="No league position is available." /> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>{detail.standings.map((row) => {
      const compSrcs = competitionLogoSources({ logo_url: row.competition.logo_url, provider_competition_id: row.competition.provider_competition_id, provider_name: row.competition.provider_name });
      return <button key={`${row.competition.slug}-${row.position}`} type="button" onClick={() => onOpenCompetition(row.competition.slug)} style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.07)", color: "#ececf1", textAlign: "left", borderRadius: 10, padding: 12, cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Crest src={compSrcs[0]} fallbackSrcs={compSrcs.slice(1)} name={row.competition.name} size={24} /><strong style={{ flex: 1, fontSize: 13 }}>{row.competition.name}</strong><span style={{ color: "#dc2626", fontSize: 18, fontWeight: 900 }}>#{row.position}</span></div><small style={{ display: "block", marginTop: 8, color: "#8b8b9a" }}>{row.points} points · {row.played} played</small></button>;
    })}</div>}</section>
  </div>;
}

function TeamMatches({ title, matches, onOpenMatch, empty }: { title: string; matches: ApiTeamDetail["recent_matches"]; onOpenMatch: (id: number) => void; empty: string }) {
  return <section style={{ margin: "24px 20px 0" }}><h2 style={{ fontSize: 15, margin: "0 0 10px" }}>{title}</h2>{matches.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>{matches.map((match) => <MatchRow key={match.id} match={toFixtureCard(match)} onClick={() => onOpenMatch(match.id)} />)}</div> : <EmptyState title={empty} />}</section>;
}
