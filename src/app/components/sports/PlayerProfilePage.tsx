import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Star, TrendingUp, Award, Target, Activity,
  ChevronRight, Flag, Calendar, Zap, Shield
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { Screen } from "./types";

interface PlayerProfilePageProps {
  setActiveScreen: (s: Screen) => void;
}

const player = {
  name: "Erling Haaland",
  number: 9,
  position: "Centre Forward",
  posAbbr: "ST",
  team: "Manchester City",
  teamAbbr: "MCI",
  teamColor: "#6dcff6",
  nationality: "Norway",
  flag: "🇳🇴",
  age: 23,
  height: "194 cm",
  foot: "Left",
  marketValue: "€200M",
  contract: "2027",
  rating: 9.1,
  goals: 34,
  assists: 5,
  apps: 33,
  mins: 2847,
  shots: 112,
  shotsOnTarget: 67,
  conversion: "30.4%",
  xG: 28.7,
  xGOverperformance: "+5.3",
  headersGoals: 12,
  dribbles: 41,
  aerialWon: "76%",
};

const seasonGoals = [
  { month: "Aug", goals: 4 }, { month: "Sep", goals: 6 }, { month: "Oct", goals: 3 },
  { month: "Nov", goals: 5 }, { month: "Dec", goals: 2 }, { month: "Jan", goals: 4 },
  { month: "Feb", goals: 3 }, { month: "Mar", goals: 5 }, { month: "Apr", goals: 2 },
];

const radarStats = [
  { stat: "Finishing", value: 97 },
  { stat: "Positioning", value: 95 },
  { stat: "Pace", value: 89 },
  { stat: "Heading", value: 94 },
  { stat: "Physical", value: 92 },
  { stat: "Link Play", value: 78 },
];

const recentMatches = [
  { opponent: "Arsenal", result: "W", score: "2–1", goals: 2, assists: 0, rating: 9.4, date: "Jun 3", competition: "EPL" },
  { opponent: "Real Madrid", result: "D", score: "1–1", goals: 1, assists: 0, rating: 8.1, date: "May 29", competition: "UCL" },
  { opponent: "Liverpool", result: "W", score: "3–0", goals: 2, assists: 1, rating: 9.7, date: "May 24", competition: "EPL" },
  { opponent: "Chelsea", result: "W", score: "4–1", goals: 3, assists: 0, rating: 9.9, date: "May 18", competition: "EPL" },
  { opponent: "Barcelona", result: "L", score: "1–2", goals: 1, assists: 0, rating: 7.2, date: "May 12", competition: "UCL" },
];

const careerStats = [
  { club: "Man City",    season: "2025/26", apps: 33, goals: 34, assists: 5  },
  { club: "Man City",    season: "2024/25", apps: 36, goals: 38, assists: 7  },
  { club: "Man City",    season: "2023/24", apps: 31, goals: 27, assists: 4  },
  { club: "Man City",    season: "2022/23", apps: 35, goals: 52, assists: 9  },
  { club: "Dortmund",    season: "2021/22", apps: 24, goals: 22, assists: 8  },
];

const TABS = ["Overview", "Stats", "Career", "Matches"];

function StatCard({ label, value, sub, color = "#00d4ff" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px", padding: "16px 18px",
      borderTop: `2px solid ${color}40`,
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "30px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      {sub && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: color, marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

export function PlayerProfilePage({ setActiveScreen }: PlayerProfilePageProps) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div style={{ background: "#07070f", minHeight: "100vh" }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .custom-tooltip { background: rgba(13,13,28,0.97) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; }
        .pp-overview-charts { display: grid; grid-template-columns: minmax(0,1fr) minmax(240px,300px); gap: 20px; }
        @media (max-width: 700px) { .pp-overview-charts { grid-template-columns: 1fr; } }
      `}</style>

      {/* Breadcrumb */}
      <div style={{
        padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px",
        borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(13,13,28,0.9)",
        backdropFilter: "blur(12px)",
      }}>
        <button onClick={() => setActiveScreen("standings")} style={{
          display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none",
          cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#7b80a0",
        }}>
          <ArrowLeft size={14} /> Standings
        </button>
        <span style={{ color: "#2e3050" }}>/</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280" }}>{player.team}</span>
        <span style={{ color: "#2e3050" }}>/</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c0c5e0", fontWeight: 600 }}>{player.name}</span>
      </div>

      {/* Hero Section */}
      <div style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, #07070f 0%, #0d1a2e 50%, #07070f 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* BG glow */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: `radial-gradient(circle, ${player.teamColor}15 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div style={{ padding: "32px 32px 28px", display: "flex", gap: "32px", alignItems: "center", position: "relative", zIndex: 1 }}>
          {/* Jersey avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "24px",
              background: `linear-gradient(135deg, ${player.teamColor}30, ${player.teamColor}10)`,
              border: `2px solid ${player.teamColor}40`,
              display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "4px",
              boxShadow: `0 8px 40px ${player.teamColor}20`,
            }}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: 900, color: player.teamColor, lineHeight: 1 }}>
                {player.number}
              </span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, color: player.teamColor + "99", letterSpacing: "1px" }}>
                {player.posAbbr}
              </span>
            </div>
            <div style={{
              position: "absolute", bottom: "-8px", right: "-8px",
              background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.4)",
              borderRadius: "8px", padding: "3px 7px",
              display: "flex", alignItems: "center", gap: "3px",
            }}>
              <Star size={9} fill="#f5c518" color="#f5c518" />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 900, color: "#f5c518" }}>{player.rating}</span>
            </div>
          </div>

          {/* Player info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>{player.flag}</span>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>{player.nationality} · {player.position}</span>
              <div style={{
                background: `${player.teamColor}20`, border: `1px solid ${player.teamColor}40`,
                borderRadius: "6px", padding: "2px 8px",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 700, color: player.teamColor,
              }}>{player.team}</div>
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "48px", fontWeight: 900,
              color: "#fff", textTransform: "uppercase", letterSpacing: "-1px",
              lineHeight: 1, margin: "0 0 12px",
            }}>{player.name}</h1>

            {/* Quick attributes */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                { label: "Age", value: player.age },
                { label: "Height", value: player.height },
                { label: "Foot", value: player.foot },
                { label: "Contract", value: player.contract },
                { label: "Value", value: player.marketValue },
              ].map(attr => (
                <div key={attr.label}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{attr.label}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#fff" }}>{attr.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Season summary */}
          <div style={{
            flexShrink: 0, background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "18px 24px", textAlign: "center",
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
              Season 2025/26
            </div>
            <div style={{ display: "flex", gap: "20px" }}>
              {[
                { label: "Goals", value: player.goals, color: "#00ff87" },
                { label: "Assists", value: player.assists, color: "#00d4ff" },
                { label: "Apps", value: player.apps, color: "#9095b8" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280", marginTop: "3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", padding: "0 32px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500,
                color: activeTab === tab ? "#fff" : "#5e6280",
                borderBottom: `2px solid ${activeTab === tab ? "#00d4ff" : "transparent"}`,
                transition: "all 0.18s",
              }}
            >{tab}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "28px 32px 48px" }}>
        <AnimatePresence mode="wait">

          {activeTab === "Overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Key stats grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px", marginBottom: "28px" }}>
                <StatCard label="Goals" value={player.goals} sub="Season 2025/26" color="#00ff87" />
                <StatCard label="Assists" value={player.assists} sub="Direct contributions" color="#00d4ff" />
                <StatCard label="xG" value={player.xG} sub={`Over: ${player.xGOverperformance}`} color="#f5c518" />
                <StatCard label="Minutes" value={player.mins} sub={`${player.apps} appearances`} color="#9095b8" />
              </div>

              <div className="pp-overview-charts">
                {/* Goals per month chart */}
                <div style={{
                  background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "16px", padding: "20px",
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "20px" }}>
                    Goals This Season
                  </div>
                  <div style={{ height: "160px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seasonGoals} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                        <XAxis dataKey="month" tick={{ fill: "#5e6280", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#5e6280", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={false} contentStyle={{ background: "rgba(13,13,28,0.97)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", color: "#fff" }} wrapperStyle={{ outline: "none" }} />
                        <Bar dataKey="goals" radius={[4, 4, 0, 0]}>
                          {seasonGoals.map((entry, index) => (
                            <Cell key={index} fill={entry.goals >= 5 ? "#00ff87" : "#00d4ff"} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Radar chart */}
                <div style={{
                  background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "16px", padding: "20px",
                }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                    Attribute Radar
                  </div>
                  <div style={{ height: "180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarStats} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis
                          dataKey="stat"
                          tick={{ fill: "#5e6280", fontSize: 9 }}
                        />
                        <Radar
                          dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.12}
                          strokeWidth={1.5}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent matches */}
              <div style={{
                marginTop: "20px",
                background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px", padding: "20px",
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                  Recent Performances
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                  {recentMatches.map((m, i) => {
                    const resultColor = m.result === "W" ? "#00ff87" : m.result === "D" ? "#f5c518" : "#ff3b3b";
                    return (
                      <div key={i} style={{
                        background: "rgba(255,255,255,0.025)", border: `1px solid ${resultColor}20`,
                        borderRadius: "12px", padding: "14px",
                        borderLeft: `3px solid ${resultColor}60`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#e0e4f8" }}>vs {m.opponent}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
                              color: resultColor, background: `${resultColor}15`,
                              padding: "1px 6px", borderRadius: "4px",
                            }}>{m.result}</span>
                            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800, color: "#fff" }}>{m.score}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: "#00ff87", lineHeight: 1 }}>{m.goals}</div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280" }}>⚽</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: "#00d4ff", lineHeight: 1 }}>{m.assists}</div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280" }}>🎯</div>
                          </div>
                          <div style={{ marginLeft: "auto", textAlign: "right" }}>
                            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 900, color: m.rating >= 9 ? "#f5c518" : "#9095b8", lineHeight: 1 }}>{m.rating}</div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280" }}>Rating</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#3d4060", marginTop: "6px" }}>{m.date} · {m.competition}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Attack */}
                <div style={{ background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Target size={16} color="#00ff87" />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>Attack</span>
                  </div>
                  {[
                    { label: "Goals", value: player.goals, max: 50, color: "#00ff87" },
                    { label: "xG", value: player.xG, max: 40, color: "#f5c518" },
                    { label: "Shots", value: player.shots, max: 150, color: "#00d4ff" },
                    { label: "Shots on Target", value: player.shotsOnTarget, max: 100, color: "#00d4ff" },
                    { label: "Conversion Rate", value: player.conversion, max: null, color: "#9095b8" },
                    { label: "Header Goals", value: player.headersGoals, max: 20, color: "#ff9500" },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#9095b8" }}>{s.label}</span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#fff" }}>{s.value}</span>
                      </div>
                      {s.max && (
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(Number(s.value) / s.max) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ height: "100%", background: s.color, borderRadius: "2px" }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Physical & Duel */}
                <div style={{ background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Shield size={16} color="#00d4ff" />
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px" }}>Physical & Duel</span>
                  </div>
                  {[
                    { label: "Appearances", value: player.apps, max: 38, color: "#9095b8" },
                    { label: "Minutes Played", value: player.mins, max: 3420, color: "#9095b8" },
                    { label: "Aerial Duel Win%", value: player.aerialWon, max: null, color: "#ff9500" },
                    { label: "Dribbles Attempted", value: player.dribbles, max: 80, color: "#00d4ff" },
                    { label: "xG Overperformance", value: player.xGOverperformance, max: null, color: "#00ff87" },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#9095b8" }}>{s.label}</span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#fff" }}>{s.value}</span>
                      </div>
                      {s.max && (
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(Number(s.value) / s.max) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{ height: "100%", background: s.color, borderRadius: "2px" }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Career" && (
            <motion.div key="career" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{
                background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px", overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 60px 60px 60px 60px",
                  gap: "0 8px", padding: "12px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  {["Club / Season", "Competition", "Apps", "Goals", "Assists", "G/A"].map((h, i) => (
                    <div key={h} style={{
                      fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600,
                      color: "#3d4060", textTransform: "uppercase", letterSpacing: "0.07em",
                      textAlign: i >= 2 ? "center" : "left",
                    }}>{h}</div>
                  ))}
                </div>
                {careerStats.map((row, i) => (
                  <motion.div
                    key={i} whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 80px 60px 60px 60px 60px",
                      gap: "0 8px", padding: "14px 20px",
                      borderBottom: i < careerStats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>{row.club}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>{row.season}</div>
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280", display: "flex", alignItems: "center" }}>League</div>
                    {[row.apps, row.goals, row.assists, row.goals + row.assists].map((v, j) => (
                      <div key={j} style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800,
                        color: j === 1 ? "#00ff87" : j === 2 ? "#00d4ff" : j === 3 ? "#f5c518" : "#9095b8",
                        textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{v}</div>
                    ))}
                  </motion.div>
                ))}
              </div>

              {/* International career note */}
              <div style={{
                marginTop: "16px",
                background: "rgba(13,13,28,0.7)", border: "1px solid rgba(245,197,24,0.15)",
                borderRadius: "14px", padding: "16px 20px",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{ fontSize: "32px" }}>🇳🇴</div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "3px" }}>
                    Norway National Team
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#9095b8" }}>
                    48 caps · 31 international goals · Currently in World Cup qualification
                  </div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900, color: "#f5c518", lineHeight: 1 }}>31</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280" }}>int. goals</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Matches" && (
            <motion.div key="matches" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{
                background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px", overflow: "hidden",
              }}>
                {recentMatches.concat(recentMatches).map((m, i) => {
                  const resultColor = m.result === "W" ? "#00ff87" : m.result === "D" ? "#f5c518" : "#ff3b3b";
                  return (
                    <motion.div
                      key={i} whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
                      onClick={() => setActiveScreen("live-match")}
                      style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer", transition: "background 0.15s",
                      }}
                    >
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
                        color: resultColor, background: `${resultColor}15`,
                        padding: "4px 8px", borderRadius: "6px", minWidth: "28px", textAlign: "center",
                      }}>{m.result}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>vs {m.opponent} <span style={{ color: "#5e6280", fontWeight: 400 }}>· {m.score}</span></div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280", marginTop: "2px" }}>{m.date} · {m.competition}</div>
                      </div>
                      <div style={{ display: "flex", gap: "16px" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: "#00ff87", lineHeight: 1 }}>{m.goals}</div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280" }}>G</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: "#00d4ff", lineHeight: 1 }}>{m.assists}</div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280" }}>A</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 900, color: m.rating >= 9 ? "#f5c518" : "#9095b8", lineHeight: 1 }}>{m.rating}</div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280" }}>Rat.</div>
                        </div>
                      </div>
                      <ChevronRight size={14} color="#3d4060" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
