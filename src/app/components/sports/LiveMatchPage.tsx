import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Pause, Volume2, Maximize, Settings, ArrowLeft,
  Share2, Heart, AlignLeft, Clock, BarChart3, Users
} from "lucide-react";
import type { Screen } from "./types";
import {
  getMatch, getLiveMatches, toLiveCard, LiveCard, ApiMatch, ApiEvent, ApiStream,
  colorFromString, abbrFromName,
} from "./api";
import { navState } from "./navState";

interface LiveMatchPageProps {
  setActiveScreen: (s: Screen) => void;
}

const TABS = [
  { id: "commentary", label: "Commentary", icon: AlignLeft },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "lineups", label: "Lineups", icon: Users },
];

function LiveDot() {
  return <span style={{
    width: "7px", height: "7px", borderRadius: "50%", background: "#ff3b3b",
    boxShadow: "0 0 10px #ff3b3b", display: "inline-block",
    animation: "livePulse 1.4s ease-in-out infinite",
  }} />;
}

export function LiveMatchPage({ setActiveScreen }: LiveMatchPageProps) {
  const [activeTab, setActiveTab] = useState("commentary");
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(false);

  const id = navState.selectedMatchId;
  const [detail, setDetail] = useState<{ match: ApiMatch; events: ApiEvent[]; streams: ApiStream[] } | null>(null);
  const [otherLive, setOtherLive] = useState<LiveCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getMatch(id)
      .then((d) => setDetail(d))
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));
    getLiveMatches()
      .then((d) => setOtherLive(d.map(toLiveCard).filter((c) => c.id !== id)))
      .catch(() => {});
  }, [id]);

  const m = detail?.match;
  const homeName = m?.home_team?.name ?? "Home";
  const awayName = m?.away_team?.name ?? "Away";
  const matchUI = m
    ? {
        home: {
          name: homeName,
          abbr: m.home_team?.abbr || abbrFromName(homeName),
          color: m.home_team ? colorFromString(homeName) : "#9095b8",
        },
        away: {
          name: awayName,
          abbr: m.away_team?.abbr || abbrFromName(awayName),
          color: m.away_team ? colorFromString(awayName) : "#9095b8",
        },
        homeScore: m.home_score,
        awayScore: m.away_score,
        minute: m.status === "live" ? String(m.minute ?? "") : m.status === "finished" ? "FT" : "",
        league: m.competition?.name ?? m.league ?? "",
        phase: m.competition?.current_season ? `Season ${m.competition.current_season}` : "",
        venue: "",
      }
    : null;

  const commentaryItems = (detail?.events ?? [])
    .filter((e) => e.event_type)
    .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))
    .map((e) => {
      const team = m?.home_team && e.team_slug === m.home_team.slug ? "home" : "away";
      const type =
        e.event_type === "goal" ? "goal"
        : e.event_type === "yellowcard" || e.event_type === "redcard" ? "card"
        : "normal";
      return {
        min: e.minute != null ? `${e.minute}'` : (e.clock ?? ""),
        text: e.summary || `${e.event_type} — ${e.player_name || ""}`.trim(),
        type,
        team,
      };
    });

  const timelineItems = (detail?.events ?? [])
    .filter((e) => ["goal", "yellowcard", "redcard"].includes(e.event_type || ""))
    .sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0))
    .map((e) => ({
      min: e.minute ?? 0,
      type: e.event_type === "goal" ? "goal" : "card",
      team: m?.home_team && e.team_slug === m.home_team.slug ? "home" : "away",
      player: e.player_name || "",
      detail: e.event_type === "goal" ? "Goal" : e.event_type === "yellowcard" ? "Yellow" : "Red",
    }));

  const latestGoal = (detail?.events ?? [])
    .filter((e) => e.event_type === "goal")
    .sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0))[0];

  const openMatch = (mid: number) => {
    navState.selectedMatchId = mid;
    // force remount by resetting state
    setDetail(null);
    setLoading(true);
    getMatch(mid).then((d) => { setDetail(d); setLoading(false); }).catch(() => setLoading(false));
    getLiveMatches().then((d) => setOtherLive(d.map(toLiveCard).filter((c) => c.id !== mid))).catch(() => {});
  };

  if (!id) {
    return (
      <div style={{ background: "#07070f", height: "100%", display: "grid", placeItems: "center", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ opacity: 0.7, marginBottom: 12 }}>No match selected.</div>
          <button onClick={() => setActiveScreen("live-list")} style={{ background: "#e23b5a", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Back to Live Scores
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background: "#07070f", height: "100%", display: "grid", placeItems: "center", color: "#fff", opacity: 0.7 }}>
        Loading match…
      </div>
    );
  }

  if (error || !matchUI) {
    return (
      <div style={{ background: "#07070f", height: "100%", display: "grid", placeItems: "center", color: "#fff", textAlign: "center" }}>
        <div>
          <div style={{ color: "#ff7875", marginBottom: 12 }}>Could not load this match.</div>
          <button onClick={() => setActiveScreen("live-list")} style={{ background: "#e23b5a", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            Back to Live Scores
          </button>
        </div>
      </div>
    );
  }

  const minuteNum = parseInt(matchUI.minute, 10);
  const progressPct = isNaN(minuteNum) ? 0 : Math.min(100, (minuteNum / 90) * 100);

  return (
    <div style={{ background: "#07070f", height: "100%" }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .lm-split {
          display: flex;
          height: calc(100vh - 50px - var(--app-ticker-h, 0px));
          overflow: hidden;
        }
        .lm-left {
          flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden;
        }
        .lm-right {
          width: 320px; flex-shrink: 0;
          border-left: 1px solid rgba(255,255,255,0.05);
          background: rgba(10,10,20,0.85);
          overflow-y: auto; display: flex; flex-direction: column;
        }
        .lm-score-teams { display: flex; align-items: center; gap: 20px; }
        .lm-team-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px; font-weight: 800; color: #fff;
        }
        @media (max-width: 700px) {
          .lm-split { flex-direction: column; height: auto; overflow: visible; }
          .lm-left { overflow: visible; }
          .lm-right { width: 100%; border-left: none; border-top: 1px solid rgba(255,255,255,0.05); max-height: none; }
          .lm-score-teams { gap: 10px; }
          .lm-team-name { font-size: 13px; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{
        padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px",
        borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(13,13,28,0.9)",
        backdropFilter: "blur(12px)",
      }}>
        <button onClick={() => setActiveScreen("live-list")} style={{
          display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none",
          cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#7b80a0",
        }}>
          <ArrowLeft size={14} /> Live
        </button>
        <span style={{ color: "#2e3050" }}>/</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280" }}>{matchUI.league}</span>
        <span style={{ color: "#2e3050" }}>/</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#c0c5e0", fontWeight: 600 }}>
          {matchUI.home.name} vs {matchUI.away.name}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <LiveDot />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px", color: "#ff3b3b" }}>LIVE</span>
          </div>
          <button onClick={() => setLiked(!liked)} style={{
            background: liked ? "rgba(255,59,59,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${liked ? "rgba(255,59,59,0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "7px", padding: "5px 8px", cursor: "pointer", color: liked ? "#ff3b3b" : "#5e6280",
          }}>
            <Heart size={13} fill={liked ? "#ff3b3b" : "none"} />
          </button>
          <button style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "7px", padding: "5px 8px", cursor: "pointer", color: "#5e6280",
          }}>
            <Share2 size={13} />
          </button>
        </div>
      </div>

      {/* MAIN SPLIT */}
      <div className="lm-split">
        <div className="lm-left">
          {/* Score header */}
          <div style={{
            padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(13,13,28,0.7)", borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div className="lm-score-teams">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: `${matchUI.home.color}22`, border: `2px solid ${matchUI.home.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 900, color: matchUI.home.color,
                }}>{matchUI.home.abbr}</div>
                <span className="lm-team-name">{matchUI.home.name}</span>
              </div>
              <div style={{ textAlign: "center", padding: "0 12px" }}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "44px", fontWeight: 900,
                  color: "#fff", letterSpacing: "-2px", lineHeight: 1,
                }}>
                  {matchUI.homeScore}<span style={{ color: "#2e3050", margin: "0 2px" }}>—</span>{matchUI.awayScore}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                  <LiveDot />
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800, color: "#ff3b3b" }}>
                    {matchUI.minute ? `${matchUI.minute}'` : "VS"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="lm-team-name">{matchUI.away.name}</span>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: `${matchUI.away.color}22`, border: `2px solid ${matchUI.away.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 900, color: matchUI.away.color,
                }}>{matchUI.away.abbr}</div>
              </div>
            </div>
          </div>

          {/* Video player */}
          <div style={{ position: "relative", height: "clamp(180px, 27vh, 260px)", background: "#000", flexShrink: 0 }}>
            <img
              src="https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=80"
              alt="Match"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.65 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)" }} />

            {latestGoal && (
              <motion.div
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: "rgba(7,7,15,0.92)", backdropFilter: "blur(14px)",
                  border: "1px solid rgba(0,255,135,0.2)", borderRadius: "10px",
                  padding: "10px 14px", width: "180px",
                }}
              >
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 800, letterSpacing: "1.5px", color: "#00ff87", marginBottom: "3px" }}>
                  ⚽ GOAL! {latestGoal.minute != null ? `${latestGoal.minute}'` : ""}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff" }}>{latestGoal.player_name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>
                  {latestGoal.team_slug === m?.home_team?.slug ? matchUI.home.name : matchUI.away.name}
                </div>
              </motion.div>
            )}

            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
              padding: "32px 16px 12px",
            }}>
              <div style={{ height: "3px", background: "rgba(255,255,255,0.2)", borderRadius: "2px", marginBottom: "10px", cursor: "pointer", position: "relative" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #00d4ff, #00ff87)", borderRadius: "2px" }} />
                <div style={{
                  position: "absolute", top: "50%", left: `${progressPct}%`, transform: "translate(-50%,-50%)",
                  width: "10px", height: "10px", borderRadius: "50%", background: "#fff",
                }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => setIsPlaying(!isPlaying)} style={{
                  width: "32px", height: "32px", borderRadius: "50%", border: "none", cursor: "pointer",
                  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isPlaying ? <Pause size={13} fill="#000" color="#000" /> : <Play size={13} fill="#000" color="#000" />}
                </button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}><Volume2 size={14} /></button>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                  {matchUI.minute ? `${matchUI.minute}'` : "0:00"} / 90:00
                </span>
                <div style={{ flex: 1 }} />
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}><Settings size={13} /></button>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}><Maximize size={13} /></button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(13,13,28,0.8)", backdropFilter: "blur(12px)", flexShrink: 0,
          }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  padding: "13px 10px", border: "none", background: "transparent", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? "#fff" : "#5e6280",
                  borderBottom: `2px solid ${activeTab === tab.id ? "#00d4ff" : "transparent"}`,
                  transition: "all 0.18s",
                }}
              >
                <tab.icon size={13} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minHeight: 0 }}>
            <AnimatePresence mode="wait">
              {activeTab === "commentary" && (
                <motion.div key="commentary" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {commentaryItems.length === 0 ? (
                    <Placeholder text="Live commentary will be available at launch." />
                  ) : (
                    commentaryItems.map((c, i) => (
                      <div key={i} style={{
                        display: "flex", gap: "12px", marginBottom: "14px",
                        paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <div style={{
                          flexShrink: 0, width: "36px", fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: "13px", fontWeight: 800, paddingTop: "2px",
                          color: c.type === "goal" ? "#00ff87" : c.type === "card" ? "#f5c518" : "#5e6280",
                        }}>{c.min}</div>
                        <div style={{
                          flex: 1, padding: c.type === "goal" ? "8px 12px" : "0",
                          background: c.type === "goal" ? (c.team === "home" ? "rgba(0,255,135,0.05)" : "rgba(229,62,62,0.05)") : "transparent",
                          borderLeft: c.type === "goal" ? `3px solid ${c.team === "home" ? "#00ff87" : "#e63946"}` : "none",
                          borderRadius: c.type === "goal" ? "0 8px 8px 0" : "0",
                          display: "flex", gap: "8px", alignItems: "flex-start",
                        }}>
                          {c.type === "goal" && <span>⚽</span>}
                          {c.type === "card" && <span>🟨</span>}
                          <p style={{
                            fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: 1.6, margin: 0,
                            color: c.type === "goal" ? "#e0e4f8" : "#8b90ad",
                            fontWeight: c.type === "goal" ? 600 : 400,
                          }}>{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === "timeline" && (
                <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {timelineItems.length === 0 ? (
                    <Placeholder text="Match events timeline will be available at launch." />
                  ) : (
                    <div style={{ position: "relative", padding: "20px 0" }}>
                      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "2px", background: "rgba(255,255,255,0.07)", transform: "translateX(-50%)" }} />
                      <div style={{
                        position: "absolute", top: 0, left: "50%", width: "2px",
                        height: `${progressPct}%`, transform: "translateX(-50%)",
                        background: "linear-gradient(180deg, #00d4ff, #00ff87)",
                      }} />
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                        <div style={{
                          background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
                          borderRadius: "7px", padding: "5px 14px",
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, color: "#00d4ff", letterSpacing: "1px",
                        }}>KICK OFF</div>
                      </div>
                      {timelineItems.map((ev, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px",
                          flexDirection: ev.team === "home" ? "row-reverse" : "row", justifyContent: "center",
                        }}>
                          <div style={{
                            flex: "0 0 160px", textAlign: ev.team === "home" ? "right" : "left",
                            background: ev.team === "home" ? "rgba(0,255,135,0.07)" : "rgba(229,62,62,0.07)",
                            border: `1px solid ${ev.team === "home" ? "rgba(0,255,135,0.15)" : "rgba(229,62,62,0.15)"}`,
                            borderRadius: "10px", padding: "9px 12px",
                          }}>
                            <div style={{
                              fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700,
                              color: ev.team === "home" ? "#00ff87" : "#e63946",
                              display: "flex", alignItems: "center", gap: "5px",
                              justifyContent: ev.team === "home" ? "flex-end" : "flex-start",
                            }}>
                              {ev.type === "goal" && "⚽"}{ev.type === "card" && "🟨"} {ev.player}
                            </div>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>{ev.detail}</div>
                          </div>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0, zIndex: 1,
                            background: ev.type === "goal" ? "rgba(0,255,135,0.15)" : "rgba(245,197,24,0.15)",
                            border: `2px solid ${ev.type === "goal" ? "rgba(0,255,135,0.4)" : "rgba(245,197,24,0.4)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 800, color: "#fff",
                          }}>{ev.min}'</div>
                          <div style={{ flex: "0 0 160px" }} />
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                        <div style={{
                          background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.2)",
                          borderRadius: "7px", padding: "5px 14px",
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700, color: "#ff3b3b", letterSpacing: "1px",
                        }}>CURRENT — {matchUI.minute ? `${matchUI.minute}'` : "VS"}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "lineups" && (
                <motion.div key="lineups" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Placeholder text="Team lineups will be available at launch." />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT panel */}
        <div className="lm-right">
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "13px", fontWeight: 800,
              color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px",
            }}>Match Statistics</div>
            <Placeholder text="Live match statistics will be available at launch." compact />
          </div>

          {/* Other live matches */}
          <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", marginTop: 16 }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 800,
              color: "#5e6280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px",
            }}>Other Live</div>
            {otherLive.length === 0 ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>No other live matches.</div>
            ) : (
              otherLive.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => openMatch(c.id)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 10px", borderRadius: "8px", marginBottom: "4px",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#c0c5e0" }}>{c.home} vs {c.away}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "9px", color: "#5e6280", marginTop: "1px" }}>{c.leagueAbbr || c.league}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 900, color: "#fff" }}>{c.homeScore}—{c.awayScore}</div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 800, color: "#ff3b3b" }}>{c.minute || "VS"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ text, compact }: { text: string; compact?: boolean }) {
  return (
    <div style={{
      textAlign: "center",
      fontFamily: "'Inter', sans-serif",
      fontSize: compact ? "12px" : "14px",
      color: "#5e6280",
      padding: compact ? "20px 8px" : "40px 8px",
      background: "rgba(255,255,255,0.02)",
      border: "1px dashed rgba(255,255,255,0.08)",
      borderRadius: 10,
    }}>
      {text}
    </div>
  );
}
