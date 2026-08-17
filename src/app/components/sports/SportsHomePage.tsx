import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Play, ChevronRight, Star, Clock, Eye, ArrowRight, Trophy, Zap, TrendingUp } from "lucide-react";
import type { Screen } from "./types";
import { getLiveMatches, getMatches, toLiveCard, toFixtureCard, LiveCard, FixtureCard, ApiMatch } from "./api";
import { navState } from "./navState";

interface SportsHomePageProps {
  setActiveScreen: (s: Screen) => void;
}

const IMGS = {
  hero: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1920&q=90",
  stadium: "https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=1200&q=80",
  night: "https://images.unsplash.com/photo-1599158150601-1417ebbaafdd?w=800&q=80",
  aerial: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
  crowd: "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=800&q=80",
  trophy: "https://images.unsplash.com/photo-1527871369852-eb58cb2b54e2?w=600&q=80",
  field: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80",
  basketball: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400&q=80",
  tennis: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80",
};

const highlights = [
  { id: 1, title: "Real Madrid 4-0 Bayern | UCL QF Highlights", duration: "8:24", views: "2.4M", thumb: IMGS.night },
  { id: 2, title: "Champions League SF Preview Show", duration: "5:12", views: "1.1M", thumb: IMGS.aerial },
  { id: 3, title: "Messi's Best 10 Goals This Season", duration: "12:07", views: "4.8M", thumb: IMGS.crowd },
  { id: 4, title: "Premier League Top Saves — Matchday 35", duration: "4:30", views: "890K", thumb: IMGS.field },
];

const leagues = [
  { name: "Champions League", abbr: "UCL", color: "#1a56db", icon: "🏆" },
  { name: "World Cup 2026", abbr: "WC", color: "#f5c518", icon: "🌍" },
  { name: "Premier League", abbr: "EPL", color: "#7c3aed", icon: "🦁" },
  { name: "La Liga", abbr: "LAL", color: "#e53e3e", icon: "🔴" },
  { name: "Serie A", abbr: "SA", color: "#0066b3", icon: "🇮🇹" },
  { name: "Bundesliga", abbr: "BUN", color: "#d20515", icon: "🦅" },
];

const trendingSports = [
  { name: "Football", icon: "⚽", live: 24 },
  { name: "Basketball", icon: "🏀", live: 8, img: IMGS.basketball },
  { name: "Tennis", icon: "🎾", live: 12, img: IMGS.tennis },
  { name: "Formula 1", icon: "🏎️", live: 1 },
  { name: "Boxing", icon: "🥊", live: 2 },
  { name: "Golf", icon: "⛳", live: 0 },
];

function LiveDot() {
  return (
    <span style={{
      width: "6px", height: "6px", borderRadius: "50%", background: "#ff3b3b",
      boxShadow: "0 0 8px #ff3b3b", display: "inline-block",
      animation: "livePulse 1.4s ease-in-out infinite",
    }} />
  );
}

function CompactMatchCard({ m, onClick }: { m: LiveCard; onClick: () => void }) {
  const isHT = m.minute === "HT";
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={onClick}
      style={{
        flexShrink: 0, minWidth: "210px", borderRadius: "14px", padding: "14px 16px", cursor: "pointer",
        background: m.hot ? "rgba(255,59,59,0.07)" : "rgba(13,13,28,0.85)",
        border: m.hot ? "1px solid rgba(255,59,59,0.25)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: m.hot ? "0 4px 24px rgba(255,59,59,0.12)" : "0 4px 16px rgba(0,0,0,0.3)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#5e6280", letterSpacing: "0.04em" }}>{m.league}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <LiveDot />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 800,
            color: isHT ? "#f5c518" : "#ff3b3b",
          }}>{m.minute}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%", margin: "0 auto 5px",
            background: `${m.homeColor}22`, border: `1.5px solid ${m.homeColor}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 900, color: m.homeColor,
          }}>{m.homeAbbr}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#c0c5e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60px", margin: "0 auto" }}>{m.home}</div>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 900,
            color: "#fff", letterSpacing: "-1px", lineHeight: 1,
          }}>{m.homeScore}<span style={{ color: "#2e3050" }}>—</span>{m.awayScore}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%", margin: "0 auto 5px",
            background: `${m.awayColor}22`, border: `1.5px solid ${m.awayColor}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 900, color: m.awayColor,
          }}>{m.awayAbbr}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#c0c5e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "60px", margin: "0 auto" }}>{m.away}</div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionRow({ title, badge, children, onSeeAll }: {
  title: string; badge?: React.ReactNode; children: React.ReactNode; onSeeAll?: () => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  return (
    <div style={{ marginBottom: "36px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 800,
            color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase", margin: 0,
          }}>{title}</h2>
          {badge}
        </div>
        <button
          onClick={onSeeAll}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280",
          }}
        >See all <ArrowRight size={12} /></button>
      </div>
      <div ref={rowRef} style={{
        display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px",
        scrollbarWidth: "none", msOverflowStyle: "none",
      }}>{children}</div>
    </div>
  );
}

export function SportsHomePage({ setActiveScreen }: SportsHomePageProps) {
  const [live, setLive] = useState<LiveCard[] | null>(null);
  const [upcoming, setUpcoming] = useState<FixtureCard[] | null>(null);

  useEffect(() => {
    getLiveMatches()
      .then((d) => setLive(d.map(toLiveCard)))
      .catch(() => setLive([]));
    getMatches({ limit: 60 })
      .then((d: ApiMatch[]) => {
        const sched = d.filter((m) => m.status === "scheduled").map(toFixtureCard);
        setUpcoming(sched.slice(0, 8));
      })
      .catch(() => setUpcoming([]));
  }, []);

  const openMatch = (id: number) => {
    navState.selectedMatchId = id;
    setActiveScreen("live-match");
  };

  return (
    <div style={{ background: "#07070f", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        div::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "72vh", minHeight: "500px", overflow: "hidden" }}>
        <img src={IMGS.hero} alt="World Cup"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,7,15,0.96) 0%, rgba(7,7,15,0.7) 50%, rgba(7,7,15,0.1) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(7,7,15,1) 0%, transparent 45%)" }} />

        <div style={{
          position: "absolute", bottom: "20%", left: "25%", width: "500px", height: "300px",
          background: "radial-gradient(ellipse, rgba(245,197,24,0.05) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "40px 40px 80px",
        }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.25)",
                borderRadius: "20px", padding: "4px 12px",
              }}>
                <Trophy size={12} color="#f5c518" />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px", color: "#f5c518" }}>
                  EXCLUSIVE BROADCAST
                </span>
              </div>
            </div>

            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#8b8fa8", margin: "0 0 8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Road to
            </p>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
              fontSize: "clamp(54px, 6.5vw, 92px)", color: "#fff", lineHeight: 0.9,
              textTransform: "uppercase", letterSpacing: "-1px", margin: "0 0 8px",
              textShadow: "0 4px 40px rgba(0,0,0,0.8)",
            }}>
              World Cup<br />
              <span style={{
                background: "linear-gradient(135deg, #f5c518 0%, #ff9500 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>2026</span>
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.5)", margin: "0 0 6px" }}>
              The world's biggest stage
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "0 0 24px" }}>
              🇺🇸 USA · 🇨🇦 Canada · 🇲🇽 Mexico
            </p>

            <div style={{ display: "flex", gap: "28px", marginBottom: "28px" }}>
              {[{ n: "345", l: "Days" }, { n: "12", l: "Stadiums" }, { n: "40", l: "Days Of Play" }].map(s => (
                <div key={s.l}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "32px", fontWeight: 900,
                    background: "linear-gradient(135deg, #f5c518, #ff9500)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1,
                  }}>{s.n}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#6b6040", marginTop: "2px" }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveScreen("competitions")}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", borderRadius: "10px", border: "none", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 700, color: "#000",
                  background: "linear-gradient(135deg, #f5c518 0%, #ff9500 100%)",
                  boxShadow: "0 0 24px rgba(245,197,24,0.3)",
                }}
              >
                <Trophy size={15} /> Watch Tournament
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveScreen("competitions")}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", borderRadius: "10px", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#f5c518",
                  background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)",
                }}
              >
                Explore Tournament <ChevronRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "28px 28px 20px" }}>

        {/* LIVE NOW strip */}
        <SectionRow
          title="Live Now"
          badge={
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <LiveDot />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px", color: "#ff3b3b" }}>
                {live ? `${live.length} MATCHES` : "LOADING"}
              </span>
            </div>
          }
          onSeeAll={() => setActiveScreen("live-list")}
        >
          {live === null ? (
            [0, 1, 2].map((i) => (
              <div key={i} style={{ flexShrink: 0, minWidth: "210px", height: "118px", borderRadius: "14px", background: "rgba(255,255,255,0.04)" }} />
            ))
          ) : live.length === 0 ? (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#5e6280", padding: "20px 4px" }}>
              No live matches right now. Check back during matchdays.
            </div>
          ) : (
            live.map((m) => (
              <CompactMatchCard key={m.id} m={m} onClick={() => openMatch(m.id)} />
            ))
          )}
        </SectionRow>

        {/* UPCOMING MATCHES */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 800,
              color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase", margin: 0,
            }}>Upcoming Matches</h2>
            <button onClick={() => setActiveScreen("fixtures")} style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280",
            }}>See all <ArrowRight size={12} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {upcoming === null ? (
              [0, 1, 2].map((i) => (
                <div key={i} style={{ height: "56px", borderRadius: "12px", background: "rgba(255,255,255,0.04)" }} />
              ))
            ) : upcoming.length === 0 ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#5e6280", padding: "12px 4px" }}>
                No upcoming fixtures scheduled.
              </div>
            ) : (
              upcoming.map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  onClick={() => m.status === "live" ? openMatch(m.id) : setActiveScreen("fixtures")}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "12px 16px", borderRadius: "12px", cursor: "pointer",
                    background: "rgba(13,13,28,0.7)", border: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.15s",
                  }}
                >
                  <div style={{ minWidth: "70px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800, color: "#00d4ff" }}>{m.time || "TBD"}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>{m.date !== "Unknown" ? m.date : ""}</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>{m.home}</span>
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                      background: `${m.homeColor}22`, border: `1.5px solid ${m.homeColor}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "8px", fontWeight: 900, color: m.homeColor,
                    }}>{m.homeAbbr}</div>
                  </div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: "12px", fontWeight: 700,
                    color: "#3d4060", letterSpacing: "1.5px", flexShrink: 0, width: "32px", textAlign: "center",
                  }}>VS</div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                      background: `${m.awayColor}22`, border: `1.5px solid ${m.awayColor}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: "8px", fontWeight: 900, color: m.awayColor,
                    }}>{m.awayAbbr}</div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600, color: "#e0e4f8" }}>{m.away}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#3d4060", background: "rgba(255,255,255,0.04)", borderRadius: "4px", padding: "2px 7px" }}>{m.league}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* POPULAR LEAGUES */}
        <SectionRow title="Popular Leagues" onSeeAll={() => setActiveScreen("competitions")}>
          {leagues.map(l => (
            <motion.div
              key={l.name} whileHover={{ y: -4, scale: 1.03 }}
              onClick={() => setActiveScreen("competitions")}
              style={{
                flexShrink: 0, width: "130px", borderRadius: "14px", padding: "18px 12px",
                background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", textAlign: "center",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{l.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "11px", fontWeight: 800, color: l.color, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "4px" }}>{l.abbr}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#7b80a0", lineHeight: 1.3 }}>{l.name}</div>
            </motion.div>
          ))}
        </SectionRow>

        {/* HIGHLIGHTS */}
        <SectionRow title="Football Highlights" onSeeAll={() => setActiveScreen("highlights")}>
          {highlights.map(h => (
            <motion.div
              key={h.id} whileHover={{ y: -4 }}
              onClick={() => setActiveScreen("highlights")}
              style={{
                flexShrink: 0, minWidth: "260px", borderRadius: "12px", overflow: "hidden",
                background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer",
              }}
            >
              <div style={{ position: "relative", height: "146px" }}>
                <img src={h.thumb} alt={h.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(7,7,15,0.7), transparent 60%)" }} />
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Play size={14} fill="#fff" color="#fff" />
                </div>
                <div style={{
                  position: "absolute", bottom: "6px", right: "8px",
                  background: "rgba(0,0,0,0.75)", borderRadius: "4px", padding: "2px 6px",
                  fontFamily: "'Inter', sans-serif", fontSize: "10px", fontWeight: 600, color: "#fff",
                }}>{h.duration}</div>
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600, color: "#e0e4f8", lineHeight: 1.4, marginBottom: "5px" }}>{h.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Eye size={10} color="#5e6280" />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#5e6280" }}>{h.views}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </SectionRow>

        {/* TRENDING SPORTS */}
        <SectionRow title="Trending Sports" badge={<TrendingUp size={14} color="#00ff87" />}>
          {trendingSports.map(s => (
            <motion.div
              key={s.name} whileHover={{ y: -4, scale: 1.03 }}
              style={{
                flexShrink: 0, minWidth: "120px", borderRadius: "14px", padding: "16px 12px",
                background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer", textAlign: "center", position: "relative", overflow: "hidden",
              }}
            >
              {s.img && (
                <img src={s.img} alt={s.name} style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", opacity: 0.12,
                }} />
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.3px" }}>{s.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: s.live > 0 ? "#ff3b3b" : "#5e6280", marginTop: "4px" }}>
                  {s.live > 0 ? `${s.live} Live` : "Today"}
                </div>
              </div>
            </motion.div>
          ))}
        </SectionRow>
      </div>
    </div>
  );
}
