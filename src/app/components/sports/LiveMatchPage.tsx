import { useEffect, useState } from "react";
import { ExternalLink, Radio, Share2 } from "lucide-react";
import { getMatch, teamLogoSources, type ApiEvent, type ApiMatch, type ApiStream } from "./api";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";


interface Props { matchId: number; onBack: () => void; onOpenMatch: (id: number) => void; }
type Detail = { match: ApiMatch; events: ApiEvent[]; streams: ApiStream[] };

function matchLabel(match: ApiMatch) {
  if (match.status === "live") return match.minute != null ? `${match.minute}'` : "LIVE";
  if (match.status === "finished") return "FT";
  return match.kickoff_at ? new Date(match.kickoff_at).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Scheduled";
}

export function LiveMatchPage({ matchId, onBack }: Props) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = () => {
    if (!Number.isFinite(matchId) || matchId <= 0) { setError("Invalid match link."); setLoading(false); return; }
    setLoading(true); setError(null);
    getMatch(matchId).then(setDetail).catch((err) => setError(String(err?.message || err))).finally(() => setLoading(false));
  };
  useEffect(load, [matchId]);
  useEffect(() => {
    if (detail?.match.status !== "live") return;
    const timer = window.setInterval(load, 25000);
    return () => window.clearInterval(timer);
  }, [detail?.match.status, matchId]);

  if (loading) return <EmptyState title="Loading match…" />;
  if (error || !detail) return <ErrorState message={error || "Could not load this match."} onRetry={load} />;
  const { match, events, streams } = detail;
  const embed = streams.find((stream) => stream.embed_url)?.embed_url;
  const outbound = streams.find((stream) => stream.external_url)?.external_url;
  const shareMatch = () => {
    if (navigator.share) {
      void navigator.share({ title: `${match.home_team?.name} vs ${match.away_team?.name}`, url: window.location.href }).catch(() => {});
    } else {
      void navigator.clipboard?.writeText(window.location.href);
    }
  };

  return <div style={{ minHeight: "100%", paddingBottom: 32 }}>
    <PageHeader title={match.competition?.name || match.league || "Match centre"} onBack={onBack} trailing={<button type="button" onClick={shareMatch} aria-label="Share match" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#8b8b9a", width: 32, height: 32, borderRadius: 8, display: "grid", placeItems: "center", cursor: "pointer" }}><Share2 size={15} /></button>} />
    <section style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
      <div style={{ color: match.status === "live" ? "#dc2626" : "#8b8b9a", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em" }}>{match.status === "live" && <Radio size={13} style={{ verticalAlign: "-2px", marginRight: 5 }} />}{matchLabel(match)}</div>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(14px, 5vw, 48px)" }}>
        <Team team={match.home_team} align="right" />
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "clamp(42px, 8vw, 62px)", fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{match.home_score}<span style={{ color: "#5c5c6b", margin: "0 6px" }}>–</span>{match.away_score}</div>
        <Team team={match.away_team} align="left" />
      </div>
    </section>
    <section style={{ padding: "20px", maxWidth: 980, margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 10px", fontSize: 15 }}>Watch</h2>
      {embed ? <div style={{ aspectRatio: "16 / 9", background: "#000", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}><iframe src={embed} title={`Watch ${match.home_team?.name} vs ${match.away_team?.name}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen style={{ width: "100%", height: "100%", border: 0 }} /></div> : outbound ? <div style={{ padding: 20, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, background: "#12121a" }}><p style={{ margin: "0 0 14px", color: "#c8c8d4", fontSize: 14 }}>This stream opens on the provider’s website.</p><a href={outbound} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 13px", background: "#c81e1e", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 800 }}>Open stream <ExternalLink size={14} /></a></div> : <EmptyState title="No stream is available for this match." detail="Scores and match events are still shown below." />}
    </section>
    <section style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px" }}>
      <h2 style={{ margin: "8px 0 12px", fontSize: 15 }}>Match events</h2>
      {events.length === 0 ? <EmptyState title="No match events have been reported." /> : <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden" }}>{[...events].sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0)).map((event, index) => <div key={event.id ?? index} style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 10, padding: "11px 13px", borderBottom: index < events.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}><strong style={{ color: event.event_type === "goal" ? "#22c55e" : "#8b8b9a" }}>{event.minute != null ? `${event.minute}'` : event.clock || "–"}</strong><span><strong style={{ textTransform: "capitalize" }}>{event.event_type.replace(/([A-Z])/g, " $1")}</strong>{event.player_name && ` · ${event.player_name}`}{event.summary && <span style={{ display: "block", marginTop: 3, color: "#8b8b9a", fontSize: 13 }}>{event.summary}</span>}</span></div>)}</div>}
    </section>
  </div>;
}

function Team({ team, align }: { team: ApiMatch["home_team"]; align: "left" | "right" }) {
  const srcs = team ? teamLogoSources({ logo_url: team.logo_url, provider_team_id: team.provider_team_id, provider_name: team.provider_name }) : [];
  return (
    <div style={{ width: "min(29vw, 190px)", display: "flex", flexDirection: "column", alignItems: align === "right" ? "flex-end" : "flex-start", gap: 8 }}>
      <Crest src={srcs[0]} fallbackSrcs={srcs.slice(1)} name={team?.name} abbr={team?.abbr} size={48} />
      <span style={{ fontSize: "clamp(13px, 2vw, 17px)", fontWeight: 800, textAlign: align }}>{team?.name || "TBD"}</span>
    </div>
  );
}

