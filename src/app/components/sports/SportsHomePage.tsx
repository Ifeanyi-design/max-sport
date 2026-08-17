import { useEffect, useState } from "react";
import { ArrowRight, Radio, Trophy } from "lucide-react";
import type { Screen } from "./types";
import { getCompetitions, getLiveMatches, getMatches, toCompetitionCard, toFixtureCard, type CompetitionCard, type FixtureCard } from "./api";
import { MatchRow } from "./MatchRow";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface Props { setActiveScreen: (screen: Screen) => void; onOpenMatch: (id: number) => void; onOpenCompetition: (slug: string) => void; }

export function SportsHomePage({ setActiveScreen, onOpenMatch, onOpenCompetition }: Props) {
  const [live, setLive] = useState<FixtureCard[] | null>(null);
  const [upcoming, setUpcoming] = useState<FixtureCard[] | null>(null);
  const [competitions, setCompetitions] = useState<CompetitionCard[] | null>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    Promise.all([getLiveMatches(), getMatches({ limit: 60 }), getCompetitions()]).then(([liveMatches, matches, competitionList]) => {
      setLive(liveMatches.map(toFixtureCard));
      setUpcoming(matches.filter((match) => match.status === "scheduled").slice(0, 8).map(toFixtureCard));
      setCompetitions(competitionList.map(toCompetitionCard));
    }).catch(() => setError(true));
  };
  useEffect(() => { load(); const timer = window.setInterval(load, 30000); return () => window.clearInterval(timer); }, []);

  return <div style={{ minHeight: "100%", padding: "22px 20px 34px", maxWidth: 1120, margin: "0 auto" }}>
    <header style={{ marginBottom: 24 }}><p style={{ margin: 0, color: "#8b8b9a", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>MaxSport</p><h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, margin: "3px 0 0", letterSpacing: "-0.02em" }}>Football, live and upcoming</h1></header>
    {error && <ErrorState message="Some sports data could not be loaded." onRetry={load} />}
    <Section title="Live now" action="All live" onAction={() => setActiveScreen("live-list")} icon={<Radio size={16} color="#dc2626" />}>
      {live === null ? <EmptyState title="Loading live matches…" /> : live.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>{live.map((match) => <MatchRow key={match.id} match={match} onClick={() => onOpenMatch(match.id)} />)}</div> : <EmptyState title="No live matches right now." detail="Upcoming fixtures are below." />}
    </Section>
    <Section title="Upcoming fixtures" action="All fixtures" onAction={() => setActiveScreen("fixtures")}>
      {upcoming === null ? <EmptyState title="Loading fixtures…" /> : upcoming.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>{upcoming.map((match) => <MatchRow key={match.id} match={match} onClick={() => onOpenMatch(match.id)} />)}</div> : <EmptyState title="No upcoming fixtures scheduled." />}
    </Section>
    <Section title="Competitions" action="All competitions" onAction={() => setActiveScreen("competitions")} icon={<Trophy size={16} color="#c8c8d4" />}>
      {competitions === null ? <EmptyState title="Loading competitions…" /> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>{competitions.slice(0, 12).map((competition) => <button key={competition.slug} type="button" onClick={() => onOpenCompetition(competition.slug)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "#12121a", border: "1px solid rgba(255,255,255,0.07)", color: "#ececf1", borderRadius: 10, cursor: "pointer", textAlign: "left" }}><Crest src={competition.logo} name={competition.name} abbr={competition.abbr} size={30} /><span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 750, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{competition.name}</span><span style={{ fontSize: 11, color: "#8b8b9a" }}>{competition.season || "View standings"}</span></span></button>)}</div>}
    </Section>
  </div>;
}

function Section({ title, action, onAction, icon, children }: { title: string; action: string; onAction: () => void; icon?: React.ReactNode; children: React.ReactNode }) {
  return <section style={{ marginBottom: 28 }}><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>{icon}<h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2><button type="button" onClick={onAction} style={{ marginLeft: "auto", padding: 0, border: 0, background: "transparent", color: "#c8c8d4", cursor: "pointer", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>{action}<ArrowRight size={13} /></button></div>{children}</section>;
}
