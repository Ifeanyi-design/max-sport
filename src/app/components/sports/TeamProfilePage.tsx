import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, Trophy, Users, TrendingUp, Calendar, Star, ArrowRight } from "lucide-react";
import type { Screen } from "./types";

interface TeamProfilePageProps {
  setActiveScreen: (s: Screen) => void;
}

const team = {
  name: "Real Madrid C.F.",
  abbr: "RMA",
  country: "Spain",
  league: "La Liga",
  founded: 1902,
  stadium: "Santiago Bernabéu",
  color: "#ffd700",
  accent: "#ffa500",
  manager: "Carlo Ancelotti",
  img: "https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=1200&q=80",
  stats: { wins: 26, draws: 5, losses: 4, goalsFor: 78, goalsAgainst: 33, position: 1, points: 83 },
  trophies: { ucl: 15, laliga: 36, copadelrey: 20 },
};

const form = ["W", "W", "D", "W", "W"];

const squad = [
  { num: 1, name: "Thibaut Courtois", pos: "GK", nat: "🇧🇪", apps: 28, rating: 7.8 },
  { num: 2, name: "Dani Carvajal", pos: "RB", nat: "🇪🇸", apps: 30, rating: 7.2 },
  { num: 3, name: "David Alaba", pos: "CB", nat: "🇦🇹", apps: 22, rating: 7.1 },
  { num: 5, name: "Jude Bellingham", pos: "CM", nat: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", apps: 32, rating: 8.4 },
  { num: 7, name: "Vinícius Júnior", pos: "LW", nat: "🇧🇷", apps: 33, rating: 8.6 },
  { num: 8, name: "Toni Kroos", pos: "CM", nat: "🇩🇪", apps: 28, rating: 8.0 },
  { num: 9, name: "Karim Benzema", pos: "CF", nat: "🇫🇷", apps: 29, rating: 8.1 },
  { num: 10, name: "Luka Modrić", pos: "CM", nat: "🇭🇷", apps: 31, rating: 7.9 },
  { num: 11, name: "Rodrygo", pos: "RW", nat: "🇧🇷", apps: 30, rating: 7.7 },
  { num: 20, name: "Fede Valverde", pos: "CM", nat: "🇺🇾", apps: 34, rating: 8.2 },
  { num: 22, name: "Antonio Rüdiger", pos: "CB", nat: "🇩🇪", apps: 30, rating: 7.5 },
  { num: 23, name: "Ferland Mendy", pos: "LB", nat: "🇫🇷", apps: 27, rating: 7.0 },
];

const upcomingFixtures = [
  { homeTeam: "Real Madrid", awayTeam: "Villarreal", date: "Jun 7", time: "20:00", league: "La Liga", isHome: true },
  { homeTeam: "Getafe", awayTeam: "Real Madrid", date: "Jun 14", time: "17:00", league: "La Liga", isHome: false },
  { homeTeam: "Real Madrid", awayTeam: "Athletic", date: "Jun 21", time: "21:00", league: "La Liga", isHome: true },
];

const TABS = ["Overview", "Squad", "Fixtures", "Stats"];

function FormDot({ result }: { result: string }) {
  return (
    <div style={{
      width: "28px", height: "28px", borderRadius: "50%",
      background: result === "W" ? "rgba(0,255,135,0.2)" : result === "D" ? "rgba(245,197,24,0.2)" : "rgba(255,59,59,0.2)",
      border: `2px solid ${result === "W" ? "#00ff87" : result === "D" ? "#f5c518" : "#ff3b3b"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
      color: result === "W" ? "#00ff87" : result === "D" ? "#f5c518" : "#ff3b3b",
    }}>{result}</div>
  );
}

export function TeamProfilePage({ setActiveScreen }: TeamProfilePageProps) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div style={{ background: "#07070f", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: "280px", overflow: "hidden" }}>
        <img src={team.img} alt={team.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(7,7,15,1) 0%, rgba(7,7,15,0.5) 60%, rgba(7,7,15,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(7,7,15,0.7) 0%, transparent 50%)` }} />

        <button
          onClick={() => setActiveScreen("home")}
          style={{
            position: "absolute", top: "24px", left: "24px",
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(7,7,15,0.8)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "7px 12px",
            cursor: "pointer", color: "#9095b8",
            fontFamily: "'Inter', sans-serif", fontSize: "12px",
          }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        <div style={{ position: "absolute", bottom: "24px", left: "32px", display: "flex", alignItems: "flex-end", gap: "20px" }}>
          {/* Team badge */}
          <div style={{
            width: "72px", height: "72px", borderRadius: "18px", flexShrink: 0,
            background: `${team.color}22`, border: `2px solid ${team.color}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 900, color: team.color,
            boxShadow: `0 0 30px ${team.color}33`,
          }}>{team.abbr}</div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{
                background: `${team.color}20`, border: `1px solid ${team.color}40`,
                borderRadius: "5px", padding: "2px 8px",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800, letterSpacing: "1px",
                color: team.color,
              }}>#{team.stats.position} {team.league}</div>
              <div style={{
                background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)",
                borderRadius: "5px", padding: "2px 8px",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800, letterSpacing: "1px",
                color: "#00ff87",
              }}>LIVE TONIGHT</div>
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "36px", fontWeight: 900,
              color: "#fff", margin: 0, lineHeight: 1, letterSpacing: "-0.5px",
            }}>{team.name}</h1>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#7b80a0", marginTop: "4px" }}>
              {team.country} · Est. {team.founded} · {team.stadium}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(13,13,28,0.7)", backdropFilter: "blur(12px)",
        padding: "0 32px", position: "sticky", top: 0, zIndex: 20,
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "14px 16px", border: "none", background: "transparent", cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800,
              letterSpacing: "0.5px", textTransform: "uppercase",
              color: activeTab === tab ? "#fff" : "#5e6280",
              borderBottom: `2px solid ${activeTab === tab ? "#00d4ff" : "transparent"}`,
              marginBottom: "-1px", transition: "all 0.18s",
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "28px 32px 40px" }}>

        {/* OVERVIEW */}
        {activeTab === "Overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginBottom: "24px" }}>
              {/* Season stats */}
              <div style={{
                borderRadius: "16px", padding: "22px",
                background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800,
                  color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "18px",
                }}>Season 2025/26</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "12px" }}>
                  {[
                    { label: "Wins", value: team.stats.wins, color: "#00ff87" },
                    { label: "Draws", value: team.stats.draws, color: "#f5c518" },
                    { label: "Losses", value: team.stats.losses, color: "#ff3b3b" },
                    { label: "Goals For", value: team.stats.goalsFor, color: "#00d4ff" },
                    { label: "Goals Against", value: team.stats.goalsAgainst, color: "#ff6b6b" },
                    { label: "Points", value: team.stats.points, color: team.color },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "30px", fontWeight: 900,
                        color: s.color, lineHeight: 1,
                      }}>{s.value}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280", marginTop: "3px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trophies + Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Form */}
                <div style={{
                  borderRadius: "16px", padding: "18px",
                  background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
                    color: "#5e6280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px",
                  }}>Recent Form</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {form.map((r, i) => <FormDot key={i} result={r} />)}
                  </div>
                </div>
                {/* Trophies */}
                <div style={{
                  borderRadius: "16px", padding: "18px", flex: 1,
                  background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
                    color: "#5e6280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px",
                  }}>Trophy Cabinet</div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    {[
                      { t: "UCL", n: team.trophies.ucl, c: "#1a56db" },
                      { t: "La Liga", n: team.trophies.laliga, c: "#e53e3e" },
                      { t: "Copa del Rey", n: team.trophies.copadelrey, c: "#f5c518" },
                    ].map(tr => (
                      <div key={tr.t} style={{ textAlign: "center" }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900,
                          color: tr.c, lineHeight: 1,
                        }}>{tr.n}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280", marginTop: "3px" }}>{tr.t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Next match */}
            <div style={{
              borderRadius: "16px", padding: "20px",
              background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800,
                color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px",
              }}>Next Match</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%", margin: "0 auto 6px",
                      background: `${team.color}22`, border: `2px solid ${team.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 900, color: team.color,
                    }}>RMA</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#e0e4f8" }}>Real Madrid</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 700, color: "#3d4060", letterSpacing: "2px",
                    }}>VS</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20px", fontWeight: 800, color: "#00d4ff", marginTop: "2px" }}>Jun 7</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>20:00 CET</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%", margin: "0 auto 6px",
                      background: "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 900, color: "#7b80a0",
                    }}>VIL</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#e0e4f8" }}>Villarreal</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{
                    padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
                    fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#000",
                    background: `linear-gradient(135deg, ${team.color}, ${team.accent})`,
                  }}>Watch Live</button>
                  <button style={{
                    padding: "10px 20px", borderRadius: "10px", cursor: "pointer",
                    fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#c0c5e0",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  }}>Remind Me</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SQUAD */}
        {activeTab === "Squad" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{
              background: "rgba(13,13,28,0.8)", borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
            }}>
              {/* Table header */}
              <div style={{
                display: "grid", gridTemplateColumns: "40px 1fr 60px 60px 60px 60px",
                padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}>
                {["#", "Player", "Pos", "NAT", "Apps", "Rating"].map(h => (
                  <div key={h} style={{
                    fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 700,
                    color: "#3d4060", letterSpacing: "0.1em", textTransform: "uppercase",
                    textAlign: h === "Player" ? "left" : "center",
                  }}>{h}</div>
                ))}
              </div>
              {squad.map((p, i) => (
                <motion.div
                  key={p.num}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  style={{
                    display: "grid", gridTemplateColumns: "40px 1fr 60px 60px 60px 60px",
                    padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800,
                    color: "#3d4060", display: "flex", alignItems: "center",
                  }}>#{p.num}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: `${team.color}18`, border: `1px solid ${team.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "8px", fontWeight: 900,
                      color: team.color,
                    }}>{p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>{p.name}</span>
                  </div>
                  <div style={{ textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 700, color: "#5e6280" }}>{p.pos}</div>
                  <div style={{ textAlign: "center", fontSize: "16px" }}>{p.nat}</div>
                  <div style={{ textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", color: "#9095b8" }}>{p.apps}</div>
                  <div style={{
                    textAlign: "center",
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800,
                    color: p.rating >= 8.0 ? "#00ff87" : p.rating >= 7.5 ? "#f5c518" : "#9095b8",
                  }}>{p.rating.toFixed(1)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FIXTURES */}
        {activeTab === "Fixtures" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#5e6280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>
              Upcoming Fixtures
            </div>
            {[
              { h: "Real Madrid", a: "Villarreal", d: "Jun 7", t: "20:00", l: "La Liga", isHome: true },
              { h: "Getafe", a: "Real Madrid", d: "Jun 14", t: "17:00", l: "La Liga", isHome: false },
              { h: "Real Madrid", a: "Athletic Club", d: "Jun 21", t: "21:00", l: "La Liga", isHome: true },
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "14px 18px", borderRadius: "12px", marginBottom: "8px",
                background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
              }}>
                <div style={{ minWidth: "60px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800, color: "#00d4ff" }}>{f.d}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>{f.t}</div>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>{f.h}</span>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", color: "#3d4060", letterSpacing: "1px" }}>vs</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>{f.a}</span>
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600,
                  color: "#5e6280", background: "rgba(255,255,255,0.04)", borderRadius: "5px", padding: "3px 8px",
                }}>{f.l}</div>
                {f.isHome && <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 800,
                  color: "#00d4ff", background: "rgba(0,212,255,0.08)", borderRadius: "5px", padding: "3px 8px", letterSpacing: "0.5px",
                }}>HOME</div>}
              </div>
            ))}
          </motion.div>
        )}

        {/* STATS tab */}
        {activeTab === "Stats" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
              {[
                { label: "Goals Scored", val: 78, max: 100, color: "#00ff87" },
                { label: "Goals Conceded", val: 33, max: 100, color: "#ff3b3b" },
                { label: "Clean Sheets", val: 14, max: 38, color: "#00d4ff" },
                { label: "Pass Accuracy", val: 88, max: 100, color: "#f5c518", suffix: "%" },
                { label: "Avg Possession", val: 58, max: 100, color: "#6366f1", suffix: "%" },
                { label: "Shots/Game", val: 16, max: 30, color: "#00d4ff" },
              ].map(s => (
                <div key={s.label} style={{
                  borderRadius: "14px", padding: "18px",
                  background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280", marginBottom: "10px" }}>{s.label}</div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "34px", fontWeight: 900,
                    color: s.color, lineHeight: 1, marginBottom: "10px",
                  }}>{s.val}{s.suffix || ""}</div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.val / s.max) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ height: "100%", background: s.color, borderRadius: "2px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
