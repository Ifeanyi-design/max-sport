import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Clock, TrendingUp, X, ChevronRight, Zap } from "lucide-react";
import type { Screen } from "./types";

interface SearchPageProps {
  setActiveScreen: (s: Screen) => void;
}

const trending = ["Real Madrid", "World Cup 2026", "Champions League", "Messi", "Haaland", "Premier League Final"];
const recent = ["Bayern Munich vs Real Madrid", "Premier League standings", "Vinicius Jr stats"];

const results = {
  teams: [
    { name: "Real Madrid", league: "La Liga", color: "#ffd700", abbr: "RMA" },
    { name: "Bayern Munich", league: "Bundesliga", color: "#e63946", abbr: "FCB" },
    { name: "Manchester City", league: "Premier League", color: "#6dcff6", abbr: "MCI" },
    { name: "Barcelona", league: "La Liga", color: "#004d98", abbr: "BAR" },
  ],
  matches: [
    { home: "Real Madrid", away: "Bayern Munich", score: "2-1", status: "LIVE", league: "UCL", minute: "67'" },
    { home: "Man City", away: "Liverpool", score: "1-1", status: "LIVE", league: "EPL", minute: "23'" },
    { home: "PSG", away: "Arsenal", score: "-", status: "Tomorrow", league: "UCL", minute: "20:45" },
  ],
  leagues: [
    { name: "UEFA Champions League", season: "2025/26", icon: "🏆" },
    { name: "Premier League", season: "2025/26", icon: "🦁" },
    { name: "FIFA World Cup 2026", season: "2026", icon: "🌍" },
  ],
  players: [
    { name: "Vinícius Júnior", team: "Real Madrid", position: "LW", goals: 28 },
    { name: "Erling Haaland", team: "Man City", position: "ST", goals: 34 },
    { name: "Kylian Mbappé", team: "Real Madrid", position: "ST", goals: 31 },
  ],
};

const CATEGORIES = [
  { id: "all", label: "All", icon: Search },
  { id: "teams", label: "Teams", icon: null },
  { id: "players", label: "Players", icon: null },
  { id: "leagues", label: "Leagues", icon: null },
  { id: "matches", label: "Matches", icon: Zap },
];

export function SearchPage({ setActiveScreen }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasQuery = query.trim().length > 0;

  return (
    <div style={{ background: "#07070f", minHeight: "100vh", padding: "32px" }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "40px", fontWeight: 900,
          color: "#fff", textTransform: "uppercase", letterSpacing: "-0.5px", margin: "0 0 6px", lineHeight: 1,
        }}>
          Search<span style={{
            background: "linear-gradient(135deg, #00d4ff, #00ff87)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}> Sports</span>
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#5e6280", margin: 0 }}>
          Find teams, players, leagues, and live matches
        </p>
      </div>

      {/* Search input */}
      <div style={{
        position: "relative", marginBottom: "20px",
        background: focused ? "rgba(0,212,255,0.04)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${focused ? "rgba(0,212,255,0.25)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "16px", padding: "14px 18px",
        display: "flex", alignItems: "center", gap: "14px",
        transition: "all 0.2s", boxShadow: focused ? "0 0 0 3px rgba(0,212,255,0.06)" : "none",
      }}>
        <Search size={18} color={focused ? "#00d4ff" : "#5e6280"} style={{ flexShrink: 0, transition: "color 0.2s" }} />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search teams, players, leagues, matches..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "#fff",
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#5e6280" }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      {hasQuery && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", overflowX: "auto", scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.id} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(cat.id)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: "20px",
                border: activeFilter === cat.id ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                background: activeFilter === cat.id ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600,
                color: activeFilter === cat.id ? "#00d4ff" : "#5e6280",
              }}
            >{cat.label}</motion.button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {!hasQuery ? (
          /* No query — show trending + recent */
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Recent searches */}
            {recent.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800,
                    color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0,
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <Clock size={14} color="#5e6280" /> Recent
                  </h2>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280" }}>
                    Clear all
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {recent.map((r, i) => (
                    <motion.button
                      key={i} whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                      onClick={() => setQuery(r)}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px", justifyContent: "space-between",
                        padding: "11px 14px", borderRadius: "10px",
                        backgroundColor: "rgba(0,0,0,0)", border: "none", cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Clock size={14} color="#3d4060" />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#9095b8" }}>{r}</span>
                      </div>
                      <ChevronRight size={13} color="#3d4060" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800,
                color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 14px",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <TrendingUp size={14} color="#00ff87" /> Trending Now
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {trending.map((t, i) => (
                  <motion.button
                    key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setQuery(t)}
                    style={{
                      padding: "8px 16px", borderRadius: "20px",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 500, color: "#c0c5e0",
                    }}
                  >
                    <TrendingUp size={11} style={{ display: "inline", marginRight: "6px", color: "#00ff87" }} />
                    {t}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quick category links */}
            <div>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800,
                color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 14px",
              }}>Browse</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                {[
                  { label: "Live Matches", color: "#ff3b3b", icon: "🔴", screen: "live-list" as Screen },
                  { label: "Competitions", color: "#f5c518", icon: "🏆", screen: "competitions" as Screen },
                  { label: "Highlights", color: "#00d4ff", icon: "🎬", screen: "highlights" as Screen },
                  { label: "Teams", color: "#00ff87", icon: "👥", screen: "teams" as Screen },
                ].map(item => (
                  <motion.button
                    key={item.label} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveScreen(item.screen)}
                    style={{
                      padding: "16px", borderRadius: "12px", border: `1px solid ${item.color}22`,
                      background: `${item.color}0a`, cursor: "pointer",
                      textAlign: "left", display: "flex", alignItems: "center", gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{item.icon}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#c0c5e0" }}>
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Has query — show results */
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ marginBottom: "8px", fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#5e6280" }}>
              Results for "<span style={{ color: "#c0c5e0", fontWeight: 600 }}>{query}</span>"
            </div>

            {(activeFilter === "all" || activeFilter === "matches") && (
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800,
                  color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px",
                }}>Matches</h3>
                {results.matches.map((m, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                    onClick={() => setActiveScreen(m.status === "LIVE" ? "live-match" : "fixtures")}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "12px 14px", borderRadius: "10px", cursor: "pointer", marginBottom: "4px",
                      border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(0,0,0,0)",
                    }}
                  >
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                      background: m.status === "LIVE" ? "#ff3b3b" : "#3d4060",
                      animation: m.status === "LIVE" ? "livePulse 1.4s infinite" : "none",
                      boxShadow: m.status === "LIVE" ? "0 0 6px #ff3b3b" : "none",
                    }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8", flex: 1 }}>
                      {m.home} vs {m.away}
                    </span>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 800, color: "#fff" }}>
                      {m.score}
                    </span>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800,
                      color: m.status === "LIVE" ? "#ff3b3b" : "#5e6280", letterSpacing: "0.5px",
                      background: m.status === "LIVE" ? "rgba(255,59,59,0.1)" : "rgba(255,255,255,0.04)",
                      padding: "2px 7px", borderRadius: "5px",
                    }}>{m.status === "LIVE" ? m.minute : m.status}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {(activeFilter === "all" || activeFilter === "teams") && (
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800,
                  color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px",
                }}>Teams</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {results.teams.map((t, i) => (
                    <motion.div
                      key={i} whileHover={{ y: -3 }}
                      onClick={() => setActiveScreen("teams")}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 16px", borderRadius: "12px", cursor: "pointer",
                        background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
                        minWidth: "200px",
                      }}
                    >
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: `${t.color}22`, border: `2px solid ${t.color}44`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 900,
                        color: t.color,
                      }}>{t.abbr}</div>
                      <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#e0e4f8" }}>{t.name}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>{t.league}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {(activeFilter === "all" || activeFilter === "players") && (
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "15px", fontWeight: 800,
                  color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px",
                }}>Players</h3>
                {results.players.map((p, i) => (
                  <motion.div
                    key={i} whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "12px 14px", borderRadius: "10px", cursor: "pointer", marginBottom: "4px",
                      border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(0,0,0,0)",
                    }}
                  >
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800, color: "#fff",
                    }}>{p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#e0e4f8" }}>{p.name}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>{p.team} · {p.position}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 900,
                        background: "linear-gradient(135deg, #00d4ff, #00ff87)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1,
                      }}>{p.goals}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>goals</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
