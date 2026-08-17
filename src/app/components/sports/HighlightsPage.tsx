import { useState } from "react";
import { motion } from "motion/react";
import { Play, Eye, Clock, Bookmark, Share2, TrendingUp, Zap } from "lucide-react";
import type { Screen } from "./types";

interface HighlightsPageProps {
  setActiveScreen: (s: Screen) => void;
}

const CATEGORIES = ["All", "Goals", "Match Highlights", "Best Saves", "Skills", "Interviews", "UCL", "World Cup"];

const featured = {
  title: "Real Madrid 4-0 Bayern Munich | All Goals & Highlights | Champions League QF",
  duration: "12:34", views: "4.2M", posted: "2 hours ago",
  league: "Champions League", tag: "MATCH HIGHLIGHTS",
  img: "https://images.unsplash.com/photo-1679391029864-d46f366a456b?w=1200&q=85",
};

const videos = [
  {
    id: 1, title: "Vinicius Jr. Hat-Trick vs Bayern | UCL Quarter-Final",
    duration: "5:48", views: "3.1M", posted: "3h ago", league: "UCL",
    thumb: "https://images.unsplash.com/photo-1599158150601-1417ebbaafdd?w=400&q=80",
    tag: "GOALS", hot: true,
  },
  {
    id: 2, title: "Messi's 5 Best Moments This Season — Pure Class",
    duration: "8:12", views: "6.4M", posted: "1d ago", league: "La Liga",
    thumb: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&q=80",
    tag: "SKILLS",
  },
  {
    id: 3, title: "Premier League Top 10 Goals | Matchday 35",
    duration: "6:20", views: "2.2M", posted: "2d ago", league: "Premier League",
    thumb: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=400&q=80",
    tag: "GOALS",
  },
  {
    id: 4, title: "Bayern Munich vs Leverkusen 3-1 | Full Highlights",
    duration: "9:05", views: "1.8M", posted: "2d ago", league: "Bundesliga",
    thumb: "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=400&q=80",
    tag: "MATCH HIGHLIGHTS",
  },
  {
    id: 5, title: "Neuer's 7 Incredible Saves This Season",
    duration: "4:30", views: "1.1M", posted: "3d ago", league: "Bundesliga",
    thumb: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400&q=80",
    tag: "BEST SAVES",
  },
  {
    id: 6, title: "Road to World Cup 2026 | Every Qualification Highlight",
    duration: "18:44", views: "5.7M", posted: "1w ago", league: "International",
    thumb: "https://images.unsplash.com/photo-1527871369852-eb58cb2b54e2?w=400&q=80",
    tag: "WORLD CUP",
  },
  {
    id: 7, title: "El Clásico Behind the Scenes | Exclusive Access",
    duration: "22:10", views: "3.9M", posted: "5d ago", league: "La Liga",
    thumb: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=400&q=80",
    tag: "INTERVIEWS",
  },
  {
    id: 8, title: "Champions League Best Moments 2025/26",
    duration: "14:00", views: "7.2M", posted: "4d ago", league: "UCL",
    thumb: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&q=80",
    tag: "UCL",
  },
];

function VideoCard({ v, featured: isFeatured = false }: { v: typeof videos[0]; featured?: boolean }) {
  const [saved, setSaved] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        borderRadius: "14px", overflow: "hidden", cursor: "pointer",
        background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0, width: isFeatured ? "100%" : undefined,
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        <img src={v.thumb} alt={v.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(7,7,15,0.75) 0%, transparent 55%)" }} />
        {/* Play button */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: isFeatured ? "56px" : "40px", height: isFeatured ? "56px" : "40px",
          borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          <Play size={isFeatured ? 22 : 16} fill="#fff" color="#fff" />
        </div>
        {/* Duration */}
        <div style={{
          position: "absolute", bottom: "8px", right: "8px",
          background: "rgba(0,0,0,0.75)", borderRadius: "5px", padding: "2px 7px",
          fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: 600, color: "#fff",
        }}>{v.duration}</div>
        {/* Tag */}
        <div style={{
          position: "absolute", top: "8px", left: "8px",
          background: v.tag === "GOALS" ? "rgba(255,59,59,0.8)"
            : v.tag === "WORLD CUP" ? "rgba(245,197,24,0.8)"
            : "rgba(0,212,255,0.8)",
          backdropFilter: "blur(8px)", borderRadius: "5px", padding: "2px 8px",
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 800,
          letterSpacing: "1px", color: v.tag === "WORLD CUP" ? "#000" : "#fff",
        }}>{v.tag}</div>
        {/* Hot badge */}
        {v.hot && (
          <div style={{
            position: "absolute", top: "8px", right: "8px",
            background: "rgba(255,59,59,0.9)", borderRadius: "5px", padding: "2px 8px",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "9px", fontWeight: 800,
            letterSpacing: "1px", color: "#fff", display: "flex", alignItems: "center", gap: "4px",
          }}>
            <TrendingUp size={9} /> TRENDING
          </div>
        )}
      </div>
      <div style={{ padding: isFeatured ? "16px" : "12px 14px" }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: isFeatured ? "15px" : "13px",
          fontWeight: 600, color: "#e0e4f8", lineHeight: 1.4, marginBottom: "8px",
        }}>{v.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Eye size={11} color="#5e6280" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>{v.views}</span>
            </div>
            <span style={{ color: "#2e3050" }}>·</span>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Clock size={11} color="#5e6280" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", color: "#5e6280" }}>{v.posted}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: saved ? "#00d4ff" : "#3d4060",
              }}
            ><Bookmark size={13} fill={saved ? "#00d4ff" : "none"} /></button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3d4060" }}>
              <Share2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HighlightsPage({ setActiveScreen }: HighlightsPageProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = activeCategory === "All"
    ? videos
    : videos.filter(v =>
        v.tag === activeCategory.toUpperCase() ||
        v.league.toUpperCase().includes(activeCategory.toUpperCase())
      );

  return (
    <div style={{ background: "#07070f", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "32px 32px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <Zap size={14} color="#00d4ff" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Video Hub
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "40px", fontWeight: 900,
          color: "#fff", textTransform: "uppercase", letterSpacing: "-0.5px", margin: "0 0 20px", lineHeight: 1,
        }}>
          Highlights & <span style={{
            background: "linear-gradient(135deg, #00d4ff, #00ff87)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Replays</span>
        </h1>

        {/* Category filter */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "20px" }}>
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0, padding: "7px 16px", borderRadius: "20px",
                border: activeCategory === cat ? "1px solid rgba(0,212,255,0.35)" : "1px solid rgba(255,255,255,0.08)",
                background: activeCategory === cat ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.03)",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 600,
                color: activeCategory === cat ? "#00d4ff" : "#5e6280",
                whiteSpace: "nowrap",
              }}
            >{cat}</motion.button>
          ))}
        </div>
      </div>

      {/* Featured video */}
      <div style={{ padding: "0 32px 28px" }}>
        <div style={{
          borderRadius: "20px", overflow: "hidden", cursor: "pointer",
          background: "rgba(13,13,28,0.8)", border: "1px solid rgba(255,255,255,0.08)",
          position: "relative",
        }}>
          <div style={{ position: "relative", height: "340px" }}>
            <img src={featured.img} alt={featured.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.3) 60%, transparent 100%)" }} />
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Play size={26} fill="#fff" color="#fff" />
            </div>
            <div style={{
              position: "absolute", bottom: "20px", left: "24px", right: "24px",
            }}>
              <div style={{
                display: "inline-block", marginBottom: "10px",
                background: "rgba(0,212,255,0.85)", backdropFilter: "blur(8px)",
                borderRadius: "5px", padding: "3px 10px",
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "10px", fontWeight: 800,
                letterSpacing: "1.5px", color: "#000",
              }}>{featured.tag}</div>
              <h3 style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", fontWeight: 900,
                color: "#fff", margin: "0 0 8px", lineHeight: 1.2,
              }}>{featured.title}</h3>
              <div style={{ display: "flex", gap: "14px" }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  <Eye size={11} style={{ display: "inline", marginRight: "4px" }} />{featured.views} views
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  <Clock size={11} style={{ display: "inline", marginRight: "4px" }} />{featured.duration}
                </span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  {featured.posted}
                </span>
              </div>
            </div>
            <div style={{
              position: "absolute", top: "16px", right: "16px",
              background: "rgba(0,0,0,0.7)", borderRadius: "7px", padding: "4px 10px",
              fontFamily: "'Inter', sans-serif", fontSize: "12px", fontWeight: 700, color: "#fff",
            }}>{featured.duration}</div>
          </div>
        </div>
      </div>

      {/* Video grid */}
      <div style={{ padding: "0 32px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 800,
            color: "#fff", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0,
          }}>Latest Videos</h2>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#5e6280" }}>
            {filtered.length} videos
          </span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {filtered.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <VideoCard v={v} />
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎬</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#5e6280" }}>
              No videos in this category yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
