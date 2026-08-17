import React, { useState, useEffect, useMemo } from "react";
import { Flame, ArrowLeft, ChevronDown, Wifi } from "lucide-react";
import { getLiveMatches, toLiveCard, LiveCard } from "./api";
import type { Screen } from "./types";
import { Crest } from "./Crest";

const FILTERS = ["All", "Featured"];

interface Props {
  setActiveScreen: (s: Screen) => void;
  onOpenMatch: (id: number) => void;
}

export function LiveListPage({ setActiveScreen, onOpenMatch }: Props) {
  const [layout, setLayout] = useState<"pill" | "card">("pill");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showMore, setShowMore] = useState(false);

  const [matches, setMatches] = useState<LiveCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getLiveMatches()
      .then((data) => setMatches(data.map(toLiveCard)))
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return matches;
    return matches.filter((m) => m.hot);
  }, [matches, activeFilter]);

  const visible = showMore ? filtered : filtered.slice(0, 12);
  const liveCount = matches.length;

  const openMatch = (id: number) => {
    onOpenMatch(id);
  };

  return (
    <div style={{ minHeight: "100%", background: "#0a0a10", color: "#ececf1", paddingBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
        <button onClick={() => setActiveScreen("home")} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18 }}>
          <ArrowLeft />
        </button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Live Scores</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontWeight: 800, fontSize: 12 }}>
          <Wifi /> {liveCount} LIVE
        </div>
      </div>

      <div style={{ margin: "0 12px 14px", padding: "16px 18px", borderRadius: 10, background: "#12121a", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", fontWeight: 800, fontSize: 12, letterSpacing: "0.08em" }}>
          <Flame /> LIVE NOW
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>{liveCount} matches being played right now</div>
        <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>Pick a match to watch streams and live commentary</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px 12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "6px 12px", borderRadius: 20, border: "none", fontWeight: 700, fontSize: 12,
                background: activeFilter === f ? "#c81e1e" : "#181822", color: "#ececf1", cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button onClick={() => setLayout("pill")} style={toggleBtn(layout === "pill")}>Pills</button>
          <button onClick={() => setLayout("card")} style={toggleBtn(layout === "card")}>Cards</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", opacity: 0.7, padding: 40 }}>Loading live matches…</div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: "#ff7875" }}>Could not load live matches.</div>
          <button onClick={load} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "none", background: "#c81e1e", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.7, padding: 40 }}>
          No live matches right now.
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setActiveScreen("fixtures")} style={{ color: "#c8c8d4", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              See upcoming fixtures →
            </button>
          </div>
        </div>
      ) : layout === "pill" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 12px" }}>
          {visible.map((m) => (
            <Pill key={m.id} m={m} onClick={() => openMatch(m.id)} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 12px" }}>
          {visible.map((m) => (
            <Card key={m.id} m={m} onClick={() => openMatch(m.id)} />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 12 && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => setShowMore((s) => !s)} style={{ background: "#181822", border: "1px solid rgba(255,255,255,0.08)", color: "#ececf1", padding: "8px 18px", borderRadius: 20, fontWeight: 700, cursor: "pointer" }}>
            {showMore ? "Show less" : "Show more"} <ChevronDown />
          </button>
        </div>
      )}
    </div>
  );
}

function toggleBtn(active: boolean): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 12,
    background: active ? "#c81e1e" : "#181822", color: "#ececf1", cursor: "pointer",
  };
}

function Pill({ m, onClick }: { m: LiveCard; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ cursor: "pointer", background: "#12121a", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Crest src={m.leagueLogo} name={m.league} abbr={m.leagueAbbr} size={18} />
        <span style={{ fontWeight: 700, fontSize: 13 }}>{m.leagueAbbr || m.league}</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{m.phase}</span>
        {m.minute && (
          <span style={{ marginLeft: "auto", color: "#dc2626", fontWeight: 800, fontSize: 12 }}>{m.minute}</span>
        )}
        {m.hot && <Flame style={{ color: "#ffb020" }} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Crest src={m.homeLogo} name={m.home} abbr={m.homeAbbr} size={26} />
          <span style={{ fontWeight: 700 }}>{m.home}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 18 }}>
          <span>{m.homeScore}</span>
          <span style={{ fontSize: 11, opacity: 0.5 }}>{m.minute ? "" : "VS"}</span>
          <span>{m.awayScore}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>{m.away}</span>
          <Crest src={m.awayLogo} name={m.away} abbr={m.awayAbbr} size={26} />
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <span style={{ background: "#c81e1e", color: "#fff", padding: "5px 12px", borderRadius: 7, fontWeight: 800, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 6, letterSpacing: "0.04em" }}>
          WATCH LIVE
        </span>
      </div>
    </div>
  );
}

function Card({ m, onClick }: { m: LiveCard; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ cursor: "pointer", background: "#12121a", borderRadius: 10, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, opacity: 0.7, marginBottom: 8 }}>
        <Crest src={m.leagueLogo} name={m.league} abbr={m.leagueAbbr} size={18} /><span>{m.leagueAbbr || m.league}</span>
        {m.minute && <span style={{ color: "#dc2626", fontWeight: 800 }}>{m.minute}</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Row src={m.homeLogo} abbr={m.homeAbbr} name={m.home} score={m.homeScore} />
        <Row src={m.awayLogo} abbr={m.awayAbbr} name={m.away} score={m.awayScore} />
      </div>
      <div style={{ marginTop: 10, textAlign: "center", color: "#dc2626", fontWeight: 800, fontSize: 12 }}>WATCH LIVE</div>
    </div>
  );
}

function Row({ src, abbr, name, score }: { src: string | null; abbr: string; name: string; score: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Crest src={src} name={name} abbr={abbr} size={24} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
      <span style={{ fontWeight: 900 }}>{score}</span>
    </div>
  );
}
