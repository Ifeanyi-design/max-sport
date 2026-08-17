import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, RefreshCw, Play, Check } from "lucide-react";
import { getMatches, toFixtureCard, FixtureCard, ApiMatch } from "./api";
import { navState } from "./navState";

interface Props {
  setActiveScreen: (s: string) => void;
}

function dateLabel(key: string): string {
  if (key === "Unknown") return "TBD";
  const d = new Date(key + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tK = today.toISOString().slice(0, 10);
  const tk2 = tomorrow.toISOString().slice(0, 10);
  if (key === tK) return "Today";
  if (key === tk2) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function FixturesPage({ setActiveScreen }: Props) {
  const [cards, setCards] = useState<FixtureCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<string>("All");

  const load = () => {
    setLoading(true);
    setError(null);
    getMatches({ limit: 300 })
      .then((data: ApiMatch[]) => {
        const upcoming = data.filter((m) => m.status !== "finished");
        setCards(upcoming.map(toFixtureCard));
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const dates = useMemo(() => {
    const keys = Array.from(new Set(cards.map((c) => c.date))).filter((k) => k !== "Unknown");
    keys.sort();
    return keys;
  }, [cards]);

  const leagues = useMemo(() => {
    const set = new Set(cards.map((c) => c.league).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [cards]);

  const visible = useMemo(
    () =>
      cards
        .filter((c) => (leagueFilter === "All" ? true : c.league === leagueFilter))
        .filter((c) => (selectedDate ? c.date === selectedDate : true)),
    [cards, leagueFilter, selectedDate]
  );

  useEffect(() => {
    if (!selectedDate && dates.length) setSelectedDate(dates[0]);
  }, [dates, selectedDate]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "#fff", paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
        <button onClick={() => setActiveScreen("home")} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18 }}>
          <ArrowLeft />
        </button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Fixtures</div>
        <button onClick={load} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#9095b8", cursor: "pointer" }}>
          <RefreshCw />
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 12px 10px" }}>
        {leagues.map((l) => (
          <button
            key={l}
            onClick={() => setLeagueFilter(l)}
            style={{
              flex: "0 0 auto", padding: "6px 12px", borderRadius: 16, border: "none", fontWeight: 700, fontSize: 12,
              background: leagueFilter === l ? "#e23b5a" : "#1b1d3a", color: "#fff", cursor: "pointer",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 12px 12px" }}>
        {dates.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            style={{
              flex: "0 0 auto", padding: "8px 14px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13,
              background: selectedDate === d ? "#7c8cff" : "#1b1d3a", color: "#fff", cursor: "pointer",
            }}
          >
            {dateLabel(d)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", opacity: 0.7, padding: 40 }}>Loading fixtures…</div>
      ) : error ? (
        <div style={{ textAlign: "center", color: "#ff7875", padding: 40 }}>Could not load fixtures.</div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", opacity: 0.7, padding: 40 }}>No fixtures for this filter.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 12px" }}>
          {visible.map((f) => (
            <FixtureRow
              key={f.id}
              f={f}
              onClick={f.status === "live" ? () => { navState.selectedMatchId = f.id; setActiveScreen("live-match"); } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FixtureRow({ f, onClick }: { f: FixtureCard; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", background: "#12132b", borderRadius: 12, padding: 10, border: "1px solid #23254a", display: "flex", alignItems: "center", gap: 8 }}
    >
      <div style={{ width: 44, textAlign: "center" }}>
        {f.status === "live" ? (
          <span style={{ color: "#ff4d4f", fontWeight: 800, fontSize: 12 }}>{f.min}</span>
        ) : f.status === "finished" ? (
          <Check style={{ color: "#9095b8" }} />
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700 }}>{f.time}</span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 20, height: 20, borderRadius: 4, background: f.homeColor, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800 }}>{f.homeAbbr}</span>
          <span style={{ fontWeight: 600, fontSize: 13, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.home}</span>
          <span style={{ fontWeight: 900 }}>{f.status === "upcoming" ? "" : f.hs}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
          <span style={{ width: 20, height: 20, borderRadius: 4, background: f.awayColor, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800 }}>{f.awayAbbr}</span>
          <span style={{ fontWeight: 600, fontSize: 13, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.away}</span>
          <span style={{ fontWeight: 900 }}>{f.status === "upcoming" ? "" : f.as}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontSize: 10, color: "#7c8cff", fontWeight: 700 }}>{f.league}</span>
        {f.status === "live" ? (
            <span style={{ background: "#e23b5a", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, display: "inline-flex", gap: 4, alignItems: "center" }}>
            <Play /> LIVE
          </span>
        ) : f.status === "finished" ? (
          <span style={{ fontSize: 10, opacity: 0.6 }}>FT</span>
        ) : (
          <span style={{ fontSize: 10, opacity: 0.6 }}>Upcoming</span>
        )}
      </div>
    </div>
  );
}
