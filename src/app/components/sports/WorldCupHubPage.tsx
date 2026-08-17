import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Globe, ChevronRight, Play, Clock } from "lucide-react";
import type { Screen } from "./types";

interface WorldCupHubPageProps {
  setActiveScreen: (s: Screen) => void;
}

const WC_GROUPS = [
  {
    id: "A", teams: [
      { name: "Brazil",    abbr: "BRA", flag: "🇧🇷", color: "#009c3b", p: 2, w: 2, d: 0, l: 0, gf: 5, ga: 1, pts: 6 },
      { name: "Mexico",    abbr: "MEX", flag: "🇲🇽", color: "#006847", p: 2, w: 1, d: 0, l: 1, gf: 3, ga: 3, pts: 3 },
      { name: "Serbia",    abbr: "SRB", flag: "🇷🇸", color: "#c6363c", p: 2, w: 0, d: 1, l: 1, gf: 2, ga: 4, pts: 1 },
      { name: "Croatia",   abbr: "CRO", flag: "🇭🇷", color: "#ff0000", p: 2, w: 0, d: 1, l: 1, gf: 1, ga: 3, pts: 1 },
    ]
  },
  {
    id: "B", teams: [
      { name: "France",    abbr: "FRA", flag: "🇫🇷", color: "#002395", p: 2, w: 2, d: 0, l: 0, gf: 6, ga: 2, pts: 6 },
      { name: "England",   abbr: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#ffffff", p: 2, w: 1, d: 1, l: 0, gf: 4, ga: 3, pts: 4 },
      { name: "Portugal",  abbr: "POR", flag: "🇵🇹", color: "#006600", p: 2, w: 1, d: 0, l: 1, gf: 3, ga: 3, pts: 3 },
      { name: "Morocco",   abbr: "MAR", flag: "🇲🇦", color: "#c1272d", p: 2, w: 0, d: 1, l: 1, gf: 1, ga: 6, pts: 1 },
    ]
  },
  {
    id: "C", teams: [
      { name: "Argentina", abbr: "ARG", flag: "🇦🇷", color: "#74acdf", p: 2, w: 2, d: 0, l: 0, gf: 7, ga: 0, pts: 6 },
      { name: "Germany",   abbr: "GER", flag: "🇩🇪", color: "#000000", p: 2, w: 1, d: 1, l: 0, gf: 5, ga: 2, pts: 4 },
      { name: "Spain",     abbr: "ESP", flag: "🇪🇸", color: "#aa151b", p: 2, w: 1, d: 0, l: 1, gf: 3, ga: 4, pts: 3 },
      { name: "Japan",     abbr: "JPN", flag: "🇯🇵", color: "#bc0020", p: 2, w: 0, d: 1, l: 1, gf: 1, ga: 10, pts: 1 },
    ]
  },
  {
    id: "D", teams: [
      { name: "Netherlands",abbr: "NED", flag: "🇳🇱", color: "#ff6600", p: 2, w: 2, d: 0, l: 0, gf: 5, ga: 1, pts: 6 },
      { name: "USA",        abbr: "USA", flag: "🇺🇸", color: "#3c3b6e", p: 2, w: 1, d: 0, l: 1, gf: 3, ga: 3, pts: 3 },
      { name: "Uruguay",    abbr: "URU", flag: "🇺🇾", color: "#5aaaa8", p: 2, w: 0, d: 1, l: 1, gf: 2, ga: 4, pts: 1 },
      { name: "Canada",     abbr: "CAN", flag: "🇨🇦", color: "#ff0000", p: 2, w: 0, d: 1, l: 1, gf: 1, ga: 3, pts: 1 },
    ]
  },
  {
    id: "E", teams: [
      { name: "Italy",     abbr: "ITA", flag: "🇮🇹", color: "#009246", p: 2, w: 1, d: 1, l: 0, gf: 3, ga: 1, pts: 4 },
      { name: "Colombia",  abbr: "COL", flag: "🇨🇴", color: "#fcd116", p: 2, w: 1, d: 1, l: 0, gf: 3, ga: 2, pts: 4 },
      { name: "South Korea",abbr:"KOR", flag: "🇰🇷", color: "#cd2e3a", p: 2, w: 0, d: 1, l: 1, gf: 2, ga: 3, pts: 1 },
      { name: "Senegal",   abbr: "SEN", flag: "🇸🇳", color: "#00853f", p: 2, w: 0, d: 1, l: 1, gf: 1, ga: 3, pts: 1 },
    ]
  },
  {
    id: "F", teams: [
      { name: "Belgium",   abbr: "BEL", flag: "🇧🇪", color: "#000000", p: 2, w: 2, d: 0, l: 0, gf: 6, ga: 1, pts: 6 },
      { name: "Australia", abbr: "AUS", flag: "🇦🇺", color: "#00008b", p: 2, w: 1, d: 0, l: 1, gf: 3, ga: 3, pts: 3 },
      { name: "Ecuador",   abbr: "ECU", flag: "🇪🇨", color: "#ffda00", p: 2, w: 0, d: 1, l: 1, gf: 2, ga: 4, pts: 1 },
      { name: "Saudi Arabia",abbr:"KSA",flag: "🇸🇦", color: "#006c35", p: 2, w: 0, d: 1, l: 1, gf: 1, ga: 4, pts: 1 },
    ]
  },
  {
    id: "G", teams: [
      { name: "Portugal",  abbr: "POR", flag: "🇵🇹", color: "#006600", p: 1, w: 1, d: 0, l: 0, gf: 3, ga: 0, pts: 3 },
      { name: "Turkey",    abbr: "TUR", flag: "🇹🇷", color: "#e30a17", p: 1, w: 1, d: 0, l: 0, gf: 2, ga: 1, pts: 3 },
      { name: "Ghana",     abbr: "GHA", flag: "🇬🇭", color: "#006b3f", p: 1, w: 0, d: 0, l: 1, gf: 1, ga: 2, pts: 0 },
      { name: "Switzerland",abbr:"SUI",flag: "🇨🇭", color: "#ff0000", p: 1, w: 0, d: 0, l: 1, gf: 0, ga: 3, pts: 0 },
    ]
  },
  {
    id: "H", teams: [
      { name: "Mexico",    abbr: "MEX", flag: "🇲🇽", color: "#006847", p: 1, w: 1, d: 0, l: 0, gf: 2, ga: 0, pts: 3 },
      { name: "Denmark",   abbr: "DEN", flag: "🇩🇰", color: "#c60c30", p: 1, w: 0, d: 1, l: 0, gf: 1, ga: 1, pts: 1 },
      { name: "Nigeria",   abbr: "NGA", flag: "🇳🇬", color: "#008751", p: 1, w: 0, d: 1, l: 0, gf: 1, ga: 1, pts: 1 },
      { name: "Chile",     abbr: "CHI", flag: "🇨🇱", color: "#d52b1e", p: 1, w: 0, d: 0, l: 1, gf: 0, ga: 2, pts: 0 },
    ]
  },
];

const BRACKET_ROUNDS = [
  {
    label: "Round of 16",
    matches: [
      { id: 1, home: "Brazil", homeFlag: "🇧🇷", away: "Germany", awayFlag: "🇩🇪", hs: 2, as: 1, status: "FT" },
      { id: 2, home: "France", homeFlag: "🇫🇷", away: "Colombia", awayFlag: "🇨🇴", hs: 3, as: 0, status: "FT" },
      { id: 3, home: "Argentina", homeFlag: "🇦🇷", away: "Australia", awayFlag: "🇦🇺", hs: 2, as: 0, status: "FT" },
      { id: 4, home: "Netherlands", homeFlag: "🇳🇱", away: "Spain", awayFlag: "🇪🇸", hs: null, as: null, status: "Jun 19 · 20:00" },
      { id: 5, home: "England", homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", away: "Italy", awayFlag: "🇮🇹", hs: null, as: null, status: "Jun 20 · 16:00" },
      { id: 6, home: "Belgium", homeFlag: "🇧🇪", away: "USA", awayFlag: "🇺🇸", hs: null, as: null, status: "Jun 20 · 20:00" },
      { id: 7, home: "Portugal", homeFlag: "🇵🇹", away: "Turkey", awayFlag: "🇹🇷", hs: null, as: null, status: "Jun 21 · 18:00" },
      { id: 8, home: "Mexico", homeFlag: "🇲🇽", away: "Denmark", awayFlag: "🇩🇰", hs: null, as: null, status: "Jun 21 · 22:00" },
    ]
  },
  {
    label: "Quarter-Finals",
    matches: [
      { id: 9, home: "Brazil", homeFlag: "🇧🇷", away: "France", awayFlag: "🇫🇷", hs: null, as: null, status: "Jun 25" },
      { id: 10, home: "Argentina", homeFlag: "🇦🇷", away: "TBD", awayFlag: "🏳", hs: null, as: null, status: "Jun 25" },
      { id: 11, home: "TBD", homeFlag: "🏳", away: "TBD", awayFlag: "🏳", hs: null, as: null, status: "Jun 26" },
      { id: 12, home: "TBD", homeFlag: "🏳", away: "TBD", awayFlag: "🏳", hs: null, as: null, status: "Jun 26" },
    ]
  },
  {
    label: "Semi-Finals",
    matches: [
      { id: 13, home: "TBD", homeFlag: "🏳", away: "TBD", awayFlag: "🏳", hs: null, as: null, status: "Jun 30" },
      { id: 14, home: "TBD", homeFlag: "🏳", away: "TBD", awayFlag: "🏳", hs: null, as: null, status: "Jul 1" },
    ]
  },
  {
    label: "Final",
    matches: [
      { id: 15, home: "TBD", homeFlag: "🏳", away: "TBD", awayFlag: "🏳", hs: null, as: null, status: "Jul 6 · 20:00" },
    ]
  },
];

const UPCOMING_WC = [
  { home: "Netherlands", homeFlag: "🇳🇱", away: "Spain",  awayFlag: "🇪🇸", date: "Jun 19", time: "20:00", venue: "MetLife Stadium, NJ",     round: "R16" },
  { home: "England",     homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", away: "Italy",   awayFlag: "🇮🇹", date: "Jun 20", time: "16:00", venue: "SoFi Stadium, LA",        round: "R16" },
  { home: "Belgium",     homeFlag: "🇧🇪", away: "USA",    awayFlag: "🇺🇸", date: "Jun 20", time: "20:00", venue: "AT&T Stadium, Dallas",    round: "R16" },
  { home: "Portugal",    homeFlag: "🇵🇹", away: "Turkey", awayFlag: "🇹🇷", date: "Jun 21", time: "18:00", venue: "Lumen Field, Seattle",     round: "R16" },
];

const STATS_OVERVIEW = [
  { label: "Total Matches", value: "104", icon: "⚽" },
  { label: "Goals Scored", value: "186", icon: "🥅" },
  { label: "Avg per Game", value: "2.7", icon: "📊" },
  { label: "Host Countries", value: "3", icon: "🌎" },
  { label: "Qualified Teams", value: "48", icon: "🏳" },
  { label: "Streaming Live", value: "All", icon: "📡" },
];

const TABS = ["Groups", "Bracket", "Schedule", "Stats"];

export function WorldCupHubPage({ setActiveScreen }: WorldCupHubPageProps) {
  const [activeTab, setActiveTab] = useState("Groups");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  return (
    <div style={{ background: "#07070f", minHeight: "100vh" }}>
      <style>{`
        @keyframes wc-glow { 0%,100%{box-shadow:0 0 20px rgba(245,197,24,0.2)} 50%{box-shadow:0 0 40px rgba(245,197,24,0.4)} }
      `}</style>

      {/* Hero Header */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #0d0a00 0%, #1a1200 40%, #0d0a00 100%)",
        borderBottom: "1px solid rgba(245,197,24,0.15)",
      }}>
        {/* BG radial glow */}
        <div style={{
          position: "absolute", top: "-80px", left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(245,197,24,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ padding: "32px 32px 0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", gap: "32px", alignItems: "center", marginBottom: "28px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "20px", flexShrink: 0,
              background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px",
              animation: "wc-glow 3s ease-in-out infinite",
            }}>🏆</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <Globe size={14} color="#f5c518" />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#8b6f2a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  FIFA World Cup · June – July 2026
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "52px", fontWeight: 900,
                color: "#fff", textTransform: "uppercase", letterSpacing: "-1px",
                lineHeight: 1, margin: 0,
              }}>World Cup <span style={{ background: "linear-gradient(135deg, #f5c518, #ff9500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>2026</span></h1>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#8b6f2a", marginTop: "6px" }}>
                USA · Canada · Mexico · 48 Teams · 104 Matches
              </div>
            </div>

            {/* Live now badge */}
            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
              <div style={{
                background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.3)",
                borderRadius: "12px", padding: "12px 18px", textAlign: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", justifyContent: "center" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ff3b3b", boxShadow: "0 0 8px #ff3b3b", display: "inline-block", animation: "wc-glow 1.4s infinite" }} />
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 800, color: "#ff3b3b", letterSpacing: "1px" }}>GROUP STAGE</span>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>3 LIVE</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>matches now</div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: "0", marginBottom: "0", borderTop: "1px solid rgba(245,197,24,0.1)" }}>
            {STATS_OVERVIEW.map((s, i) => (
              <div key={i} style={{
                flex: 1, padding: "14px 16px", textAlign: "center",
                borderRight: i < STATS_OVERVIEW.length - 1 ? "1px solid rgba(245,197,24,0.08)" : "none",
              }}>
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#8b6f2a", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderTop: "1px solid rgba(245,197,24,0.08)" }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "13px 22px", border: "none", background: "transparent", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500,
                  color: activeTab === tab ? "#f5c518" : "#5e6280",
                  borderBottom: `2px solid ${activeTab === tab ? "#f5c518" : "transparent"}`,
                  transition: "all 0.18s",
                }}
              >{tab}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: "28px 32px 48px" }}>
        <AnimatePresence mode="wait">

          {/* GROUPS */}
          {activeTab === "Groups" && (
            <motion.div key="groups" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "16px",
              }}>
                {WC_GROUPS.map(group => (
                  <motion.div
                    key={group.id}
                    whileHover={{ y: -2 }}
                    style={{
                      background: "rgba(13,13,28,0.8)", border: "1px solid rgba(245,197,24,0.1)",
                      borderRadius: "16px", overflow: "hidden", cursor: "pointer",
                      transition: "border 0.2s",
                    }}
                    onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
                  >
                    {/* Group header */}
                    <div style={{
                      padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "rgba(245,197,24,0.06)", borderBottom: "1px solid rgba(245,197,24,0.08)",
                    }}>
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900,
                        color: "#f5c518", letterSpacing: "1px",
                      }}>GROUP {group.id}</span>
                      <div style={{ display: "flex", gap: "3px" }}>
                        {group.teams.slice(0, 2).map(t => (
                          <span key={t.abbr} style={{ fontSize: "16px" }}>{t.flag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Column headers */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 24px 24px 24px 24px 24px 24px 30px",
                      gap: "0 4px", padding: "7px 16px",
                      background: "rgba(255,255,255,0.02)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      {["Team", "P", "W", "D", "L", "GF", "GA", "Pts"].map((h, i) => (
                        <div key={h} style={{
                          fontFamily: "'Inter', sans-serif", fontSize: "9px", fontWeight: 600,
                          color: "#3d4060", textTransform: "uppercase",
                          textAlign: i > 0 ? "center" : "left",
                        }}>{h}</div>
                      ))}
                    </div>

                    {/* Teams */}
                    {group.teams.map((team, idx) => (
                      <div key={team.abbr} style={{
                        display: "grid", gridTemplateColumns: "1fr 24px 24px 24px 24px 24px 24px 30px",
                        gap: "0 4px", padding: "9px 16px",
                        background: idx < 2 ? "rgba(0,212,255,0.03)" : "transparent",
                        borderBottom: idx < group.teams.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        borderLeft: idx < 2 ? "2px solid rgba(0,212,255,0.3)" : "2px solid transparent",
                      }}>
                        {/* Team */}
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <span style={{ fontSize: "14px" }}>{team.flag}</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: idx < 2 ? 700 : 500, color: idx < 2 ? "#e0e4f8" : "#9095b8" }}>
                            {team.name}
                          </span>
                          {idx < 2 && (
                            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 4px #00d4ff" }} />
                          )}
                        </div>
                        {[team.p, team.w, team.d, team.l, team.gf, team.ga].map((v, i) => (
                          <div key={i} style={{
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px",
                            fontWeight: 700, color: "#7b80a0", textAlign: "center",
                          }}>{v}</div>
                        ))}
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px",
                          fontWeight: 900, color: idx < 2 ? "#fff" : "#7b80a0", textAlign: "center",
                        }}>{team.pts}</div>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>

              {/* Qualification note */}
              <div style={{ marginTop: "20px", display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(0,212,255,0.25)", border: "1px solid rgba(0,212,255,0.5)" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>Qualify to Round of 16 (Top 2)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* BRACKET */}
          {activeTab === "Bracket" && (
            <motion.div key="bracket" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ overflowX: "auto", paddingBottom: "16px" }}>
                <div style={{ display: "flex", gap: "24px", minWidth: "900px" }}>
                  {BRACKET_ROUNDS.map((round, ri) => (
                    <div key={ri} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      {/* Round header */}
                      <div style={{
                        padding: "10px 14px", borderRadius: "10px 10px 0 0",
                        background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.15)",
                        borderBottom: "none", marginBottom: "0", textAlign: "center",
                      }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
                          color: "#f5c518", textTransform: "uppercase", letterSpacing: "1px",
                        }}>{round.label}</span>
                      </div>

                      {/* Matches */}
                      <div style={{
                        flex: 1, display: "flex", flexDirection: "column",
                        justifyContent: "space-around", gap: "10px",
                        padding: "10px 0",
                        border: "1px solid rgba(245,197,24,0.1)",
                        borderRadius: "0 0 12px 12px",
                        background: "rgba(13,13,28,0.6)",
                      }}>
                        {round.matches.map((m, mi) => {
                          const isDone = m.hs !== null;
                          return (
                            <motion.div
                              key={m.id}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => isDone ? setActiveScreen("live-match") : undefined}
                              style={{
                                margin: "4px 10px", borderRadius: "10px",
                                background: isDone ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                                border: isDone
                                  ? "1px solid rgba(255,255,255,0.08)"
                                  : "1px solid rgba(255,255,255,0.04)",
                                overflow: "hidden", cursor: isDone ? "pointer" : "default",
                              }}
                            >
                              {/* Home */}
                              <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span>{m.homeFlag}</span>
                                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: isDone ? "#e0e4f8" : "#5e6280" }}>{m.home}</span>
                                </div>
                                {isDone && (
                                  <span style={{
                                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px",
                                    fontWeight: 900,
                                    color: m.hs! > m.as! ? "#fff" : "#7b80a0",
                                  }}>{m.hs}</span>
                                )}
                              </div>
                              {/* Away */}
                              <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "8px 10px",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span>{m.awayFlag}</span>
                                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: isDone ? "#e0e4f8" : "#5e6280" }}>{m.away}</span>
                                </div>
                                {isDone && (
                                  <span style={{
                                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px",
                                    fontWeight: 900,
                                    color: m.as! > m.hs! ? "#fff" : "#7b80a0",
                                  }}>{m.as}</span>
                                )}
                              </div>
                              {/* Status bar */}
                              <div style={{
                                padding: "4px 10px", background: "rgba(255,255,255,0.02)",
                                borderTop: "1px solid rgba(255,255,255,0.04)",
                              }}>
                                <span style={{
                                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px",
                                  fontWeight: 700, letterSpacing: "0.5px",
                                  color: isDone ? "#5e6280" : "#f5c518",
                                }}>{isDone ? m.status : m.status}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCHEDULE */}
          {activeTab === "Schedule" && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {UPCOMING_WC.map((m, i) => (
                  <motion.div
                    key={i} whileHover={{ x: 4 }}
                    onClick={() => setActiveScreen("live-match")}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "16px 20px", borderRadius: "14px",
                      background: "rgba(13,13,28,0.8)", border: "1px solid rgba(245,197,24,0.1)",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                  >
                    {/* Round badge */}
                    <div style={{
                      background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.25)",
                      borderRadius: "8px", padding: "6px 10px", flexShrink: 0, textAlign: "center",
                    }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 900, color: "#f5c518" }}>{m.round}</div>
                    </div>

                    {/* Match */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "22px" }}>{m.homeFlag}</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, color: "#e0e4f8" }}>{m.home}</span>
                      </div>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: "#3d4060" }}>vs</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", fontWeight: 700, color: "#e0e4f8" }}>{m.away}</span>
                        <span style={{ fontSize: "22px" }}>{m.awayFlag}</span>
                      </div>
                    </div>

                    {/* Date & venue */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end", marginBottom: "4px" }}>
                        <Clock size={11} color="#f5c518" />
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff" }}>{m.date} · {m.time}</span>
                      </div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>{m.venue}</div>
                    </div>

                    <button style={{
                      flexShrink: 0, background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)",
                      borderRadius: "8px", padding: "7px 12px", cursor: "pointer",
                      fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#f5c518",
                    }}>+ Remind</button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STATS */}
          {activeTab === "Stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                {[
                  { label: "Top Scorer", value: "Vinicius Jr", sub: "6 goals", flag: "🇧🇷", color: "#00ff87" },
                  { label: "Most Assists", value: "Mbappé", sub: "4 assists", flag: "🇫🇷", color: "#00d4ff" },
                  { label: "Best Keeper", value: "Alisson", sub: "0.5 GA/G", flag: "🇧🇷", color: "#f5c518" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "rgba(13,13,28,0.8)", border: `1px solid ${s.color}30`,
                    borderRadius: "16px", padding: "20px", borderTop: `2px solid ${s.color}60`,
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.flag}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: s.color, marginTop: "4px" }}>{s.sub}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280", marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Most goals per group stage */}
              <div style={{
                background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px", padding: "20px",
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                  Group Stage Top Scorers
                </div>
                {[
                  { name: "Vinícius Jr", country: "Brazil", flag: "🇧🇷", goals: 6 },
                  { name: "Kylian Mbappé", country: "France", flag: "🇫🇷", goals: 5 },
                  { name: "Lautaro Martínez", country: "Argentina", flag: "🇦🇷", goals: 5 },
                  { name: "Harry Kane", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", goals: 4 },
                  { name: "Memphis Depay", country: "Netherlands", flag: "🇳🇱", goals: 4 },
                  { name: "Romelu Lukaku", country: "Belgium", flag: "🇧🇪", goals: 4 },
                ].map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "9px 0", borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 900, color: "#3d4060", minWidth: "20px" }}>{i + 1}</span>
                    <span style={{ fontSize: "18px" }}>{p.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>{p.name}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>{p.country}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ height: "6px", width: `${p.goals * 18}px`, background: "linear-gradient(90deg, #f5c518, #ff9500)", borderRadius: "3px" }} />
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 900, color: "#fff" }}>{p.goals}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
