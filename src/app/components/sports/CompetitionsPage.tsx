import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import type { Screen } from "./types";
import { getCompetitions, toCompetitionCard, type CompetitionCard } from "./api";
import { Crest } from "./Crest";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { PageHeader } from "./PageHeader";

interface Props {
  setActiveScreen: (screen: Screen) => void;
  onOpenCompetition: (slug: string) => void;
}

export function CompetitionsPage({ setActiveScreen, onOpenCompetition }: Props) {
  const [competitions, setCompetitions] = useState<CompetitionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = () => {
    setLoading(true);
    setError(null);
    getCompetitions().then((items) => setCompetitions(items.map(toCompetitionCard))).catch((err) => setError(String(err?.message || err))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const grouped = useMemo(() => ({
    Domestic: competitions.filter((item) => !/champions|europa|conference|international|world cup|copa|nations/i.test(item.name)),
    International: competitions.filter((item) => /champions|europa|conference|international|world cup|copa|nations/i.test(item.name)),
  }), [competitions]);

  return <div style={{ minHeight: "100%", paddingBottom: 32 }}>
    <PageHeader title="Competitions" onBack={() => setActiveScreen("home")} onRefresh={load} />
    {loading ? <EmptyState title="Loading competitions…" /> : error ? <ErrorState message="Could not load competitions." onRetry={load} /> : competitions.length === 0 ? <EmptyState title="No competitions available" /> : Object.entries(grouped).map(([title, items]) => items.length > 0 && (
      <section key={title} style={{ padding: "8px 20px 16px" }}>
        <h2 style={{ margin: "10px 0 10px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8b8b9a" }}>{title}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
          {items.map((competition) => <button key={competition.slug} type="button" onClick={() => onOpenCompetition(competition.slug)} style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "#12121a", color: "#ececf1", cursor: "pointer" }}>
            <Crest src={competition.logo} name={competition.name} abbr={competition.abbr} size={34} />
            <span style={{ minWidth: 0, flex: 1 }}><span style={{ display: "block", fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{competition.name}</span><span style={{ display: "block", marginTop: 3, fontSize: 11, color: "#8b8b9a" }}>{competition.season ? `Season ${competition.season}` : "View table"}</span></span>
            <Trophy size={16} color="#8b8b9a" />
          </button>)}
        </div>
      </section>
    ))}
  </div>;
}
