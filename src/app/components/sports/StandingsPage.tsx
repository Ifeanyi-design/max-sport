import React, { useState, useEffect, useMemo } from "react";
import { Trophy, ArrowLeft, RefreshCw } from "lucide-react";
import { leagueStyle, getCompetitions, getStandings, toStandingRow, StandingRow, ApiCompetition } from "./api";

interface LeagueTab {
  slug: string;
  id: string;
  name: string;
  abbr: string;
  color: string;
  flag: string;
}

// Curated tabs — these are the competitions we reliably carry standings for.
const TABS: LeagueTab[] = [
  { slug: "english-premier-league", id: "epl", name: "Premier League", ...leagueStyle("english-premier-league"), abbr: "EPL" },
  { slug: "uefa-champions-league", id: "ucl", name: "Champions League", ...leagueStyle("uefa-champions-league"), abbr: "UCL" },
  { slug: "la-liga", id: "laliga", name: "La Liga", ...leagueStyle("la-liga"), abbr: "LL" },
  { slug: "serie-a", id: "seriea", name: "Serie A", ...leagueStyle("serie-a"), abbr: "SA" },
  { slug: "bundesliga", id: "bundesliga", name: "Bundesliga", ...leagueStyle("bundesliga"), abbr: "BUN" },
  { slug: "ligue-1", id: "ligue1", name: "Ligue 1", ...leagueStyle("ligue-1"), abbr: "L1" },
];

const COLS = [
  { label: "#", w: 28 },
  { label: "TEAM", w: 150 },
  { label: "P", w: 24 },
  { label: "W", w: 24 },
  { label: "D", w: 24 },
  { label: "L", w: 24 },
  { label: "GF", w: 28 },
  { label: "GA", w: 28 },
  { label: "GD", w: 32 },
  { label: "PTS", w: 34 },
];

interface Props {
  setActiveScreen: (s: string) => void;
}

export function StandingsPage({ setActiveScreen }: Props) {
  const [selected, setSelected] = useState<string>(TABS[0].slug);
  const [rows, setRows] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<ApiCompetition[]>([]);

  useEffect(() => {
    getCompetitions().then(setCompetitions).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    getStandings(selected)
      .then((data) => setRows(data.map(toStandingRow)))
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [selected]);

  const activeTab = TABS.find((t) => t.slug === selected)!;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "#fff", paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
        <button onClick={() => setActiveScreen("home")} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 18 }}>
          <ArrowLeft />
        </button>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Standings</div>
        <button onClick={load} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#9095b8", cursor: "pointer" }}>
          <RefreshCw />
        </button>
      </div>

      {/* League tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 12px 12px" }}>
        {TABS.map((t) => (
          <button
            key={t.slug}
            onClick={() => setSelected(t.slug)}
            style={{
              flex: "0 0 auto", padding: "8px 14px", borderRadius: 12, border: "none", fontWeight: 800, fontSize: 13,
              background: selected === t.slug ? t.color : "#1b1d3a", color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span>{t.flag}</span> {t.abbr}
          </button>
        ))}
      </div>

      {/* Header */}
      <div style={{ margin: "0 12px 10px", padding: "14px 16px", borderRadius: 14, background: `linear-gradient(135deg, ${activeTab.color}, #1b1d3a)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <Trophy /> {activeTab.name}
          </div>
        <div style={{ opacity: 0.75, fontSize: 13, marginTop: 2 }}>2024/25 Season · Table</div>
      </div>

      {/* Table */}
      <div style={{ margin: "0 12px", background: "#12132b", borderRadius: 12, overflow: "hidden", border: "1px solid #23254a" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderBottom: "1px solid #23254a", fontSize: 11, opacity: 0.6, fontWeight: 700 }}>
          {COLS.map((c) => (
            <div key={c.label} style={{ width: c.w, textAlign: c.label === "TEAM" ? "left" : "center" }}>{c.label}</div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11 }}>FORM</div>
        </div>

        {loading ? (
          <div style={{ padding: 30, textAlign: "center", opacity: 0.7 }}>Loading standings…</div>
        ) : error ? (
          <div style={{ padding: 30, textAlign: "center", color: "#ff7875" }}>Could not load standings.</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", opacity: 0.7 }}>No standings available yet.</div>
        ) : (
          rows.map((r) => {
            const zoneColor =
              r.zone === "champions" ? "#2f9e44" : r.zone === "relegation" ? "#e03131" : "transparent";
            return (
              <div
                key={r.pos}
                style={{
                  display: "flex", alignItems: "center", padding: "8px 10px", borderLeft: `3px solid ${zoneColor}`,
                  borderBottom: "1px solid #1a1c38",
                }}
              >
                <div style={{ width: 28, textAlign: "center", fontSize: 12 }}>{r.pos}</div>
                <div style={{ width: 150, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 4, background: r.color, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 800 }}>
                    {r.abbr}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.team}</span>
                </div>
                <div style={{ width: 24, textAlign: "center", fontSize: 12 }}>{r.p}</div>
                <div style={{ width: 24, textAlign: "center", fontSize: 12 }}>{r.w}</div>
                <div style={{ width: 24, textAlign: "center", fontSize: 12 }}>{r.d}</div>
                <div style={{ width: 24, textAlign: "center", fontSize: 12 }}>{r.l}</div>
                <div style={{ width: 28, textAlign: "center", fontSize: 12 }}>{r.gf}</div>
                <div style={{ width: 28, textAlign: "center", fontSize: 12 }}>{r.ga}</div>
                <div style={{ width: 32, textAlign: "center", fontSize: 12 }}>{r.gd > 0 ? "+" + r.gd : r.gd}</div>
                <div style={{ width: 34, textAlign: "center", fontSize: 13, fontWeight: 900, color: "#ffd43b" }}>{r.pts}</div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
                  {["", "", "", "", ""].map((_, i) => (
                    <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: "#2a2d52" }} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 12, fontSize: 11, opacity: 0.7 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#2f9e44", borderRadius: 2 }} /> Champions League</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, background: "#e03131", borderRadius: 2 }} /> Relegation</span>
      </div>
    </div>
  );
}
