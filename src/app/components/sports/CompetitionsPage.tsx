import React, { useState, useEffect, useMemo } from "react";
import { Trophy, ArrowLeft, RefreshCw, Star } from "lucide-react";
import { getCompetitions, toCompetitionCard, CompetitionCard, ApiCompetition } from "./api";

interface Props {
  setActiveScreen: (s: string) => void;
}

export function CompetitionsPage({ setActiveScreen }: Props) {
  const [comps, setComps] = useState<CompetitionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getCompetitions()
      .then((data: ApiCompetition[]) => setComps(data.map(toCompetitionCard)))
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const featured = comps.find((c) => c.season) ?? comps[0];
  const club = useMemo(() => comps.filter((c) => !/champions league|europa|euro|copa|world cup|nations/i.test(c.name)), [comps]);
  const intl = useMemo(() => comps.filter((c) => /champions league|europa|euro|copa|world cup|nations/i.test(c.name)), [comps]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "#fff", paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
        <button onClick={() => setActiveScreen("home")} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18 }}>
          <ArrowLeft />
        </button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Competitions</div>
        <button onClick={load} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#9095b8", cursor: "pointer" }}>
          <RefreshCw />
        </button>
      </div>

      {/* Featured hero */}
      {featured && (
        <div
          onClick={() => setActiveScreen("standings")}
          style={{ margin: "0 12px 14px", padding: 18, borderRadius: 16, cursor: "pointer", background: `linear-gradient(135deg, ${featured.color}, #1b1d3a)` }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9, fontWeight: 700 }}>
            <Star style={{ color: "#ffd43b" }} /> FEATURED
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{featured.flag} {featured.name}</div>
          <div style={{ opacity: 0.75, marginTop: 4 }}>Season {featured.season} · View standings & fixtures</div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", opacity: 0.7, padding: 40 }}>Loading competitions…</div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "#ff7875", padding: 40 }}>Could not load competitions.</div>
      ) : (
        <>
          <Section title="Club Competitions" items={club} onOpen={() => setActiveScreen("standings")} />
          <Section title="International" items={intl} onOpen={() => setActiveScreen("standings")} />
        </>
      )}
    </div>
  );
}

function Section({ title, items, onOpen }: { title: string; items: CompetitionCard[]; onOpen: () => void }) {
  if (!items.length) return null;
  return (
    <div style={{ margin: "0 12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Trophy style={{ color: "#ffd43b" }} />
        <span style={{ fontWeight: 800 }}>{title}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {items.map((c) => (
          <div
            key={c.slug}
            onClick={onOpen}
            style={{ cursor: "pointer", background: "#12132b", borderRadius: 14, padding: 12, border: "1px solid #23254a", borderTop: `3px solid ${c.color}` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: c.color, display: "grid", placeItems: "center", fontSize: 16 }}>{c.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: 11, opacity: 0.65 }}>{c.abbr} · {c.season || "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
