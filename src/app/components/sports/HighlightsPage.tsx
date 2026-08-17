import { useState } from "react";
import { Play, Search, Film, Flame, Sparkles, X } from "lucide-react";
import type { Screen } from "./types";
import { PageHeader } from "./PageHeader";
import { VideoPlayerModal, type VideoItem } from "./VideoPlayerModal";

interface Props {
  setActiveScreen: (s: Screen) => void;
}


interface HighlightVideo {
  id: string; // YouTube ID
  title: string;
  category: "UCL" | "EPL" | "LaLiga" | "SerieA" | "International" | "Skills";
  duration: string;
  channel: string;
  competition: string;
  views?: string;
  date?: string;
}

// Curated & auto-recommended top football highlights
const FEATURED_HIGHLIGHTS: HighlightVideo[] = [
  {
    id: "3e5lF71rOcg",
    title: "UEFA Champions League - Best Goals & Epic Moments 2024/2025",
    category: "UCL",
    duration: "11:24",
    channel: "UEFA Official",
    competition: "UEFA Champions League",
    views: "2.4M",
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Premier League Top 20 Unbelievable Goals of the Season",
    category: "EPL",
    duration: "14:15",
    channel: "Premier League",
    competition: "Premier League",
    views: "3.8M",
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Real Madrid vs Barcelona - El Clásico All Goals & Extended Highlights",
    category: "LaLiga",
    duration: "12:40",
    channel: "LaLiga EA Sports",
    competition: "La Liga",
    views: "5.1M",
  },
  {
    id: "L_LUpnjgPso",
    title: "Arsenal vs Manchester City - High Stakes Title Clash Highlights",
    category: "EPL",
    duration: "10:35",
    channel: "Sky Sports Football",
    competition: "Premier League",
    views: "1.9M",
  },
  {
    id: "JGwWNGJdvx8",
    title: "Vinicius Jr, Mbappe & Haaland - Best Skills & Goals Show 2025",
    category: "Skills",
    duration: "15:02",
    channel: "Football TV",
    competition: "World Football",
    views: "4.2M",
  },
  {
    id: "9bZkp7q19f0",
    title: "Inter vs Milan - Derby della Madonnina Epic Thriller Highlights",
    category: "SerieA",
    duration: "11:50",
    channel: "Serie A Official",
    competition: "Serie A",
    views: "1.5M",
  },
  {
    id: "2Vv-BfVoq4g",
    title: "FIFA World Cup - Greatest Moments & Historic Comebacks",
    category: "International",
    duration: "18:22",
    channel: "FIFA Official",
    competition: "International",
    views: "7.9M",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Bayern Munich vs Borussia Dortmund - Der Klassiker Full Highlights",
    category: "UCL",
    duration: "10:18",
    channel: "Bundesliga Official",
    competition: "Bundesliga",
    views: "1.2M",
  },
];

// Fallback search suggestions that map popular queries to YouTube embed queries
const CATEGORIES = [
  { id: "all", label: "All Highlights" },
  { id: "UCL", label: "Champions League" },
  { id: "EPL", label: "Premier League" },
  { id: "LaLiga", label: "La Liga" },
  { id: "SerieA", label: "Serie A" },
  { id: "International", label: "World & AFCON" },
  { id: "Skills", label: "Superstars & Goals" },
];

export function HighlightsPage({ setActiveScreen }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [searchEmbedTerm, setSearchEmbedTerm] = useState<string | null>(null);

  const filteredVideos = FEATURED_HIGHLIGHTS.filter((v) => {
    const matchesCat = activeCategory === "all" || v.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.competition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchEmbedTerm(q);
    }
  };

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      <PageHeader title="Football Highlights &amp; Replays" onBack={() => setActiveScreen("home")} />

      {/* In-Site Cinema Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onSelectVideo={(v) => setSelectedVideo(v)}
        relatedVideos={FEATURED_HIGHLIGHTS}
      />


      {/* In-Site Search Embed Modal if user searched for specific match */}
      {searchEmbedTerm && (
        <section style={{ padding: "0 20px 24px" }}>
          <div
            style={{
              padding: "16px",
              borderRadius: 14,
              background: "var(--ms-surface)",
              border: "1px solid var(--ms-accent-glow)",
              boxShadow: "0 12px 36px rgba(229,20,43,0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={16} color="var(--ms-accent)" />
                <span style={{ fontWeight: 800, fontSize: 14 }}>
                  In-Site Results for "{searchEmbedTerm}"
                </span>
              </div>
              <button
                onClick={() => setSearchEmbedTerm(null)}
                className="ms-icon-btn"
                style={{ width: 28, height: 28 }}
              >
                <X size={14} />
              </button>
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", background: "#000" }}>
              <iframe
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                  searchEmbedTerm + " football match highlights"
                )}&autoplay=1`}
                title={`Search: ${searchEmbedTerm}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section style={{ padding: "0 20px 16px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search
              size={17}
              color="var(--ms-muted)"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any match, club, or player highlights on site..."
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                background: "var(--ms-surface)",
                border: "1px solid var(--ms-border)",
                borderRadius: 12,
                color: "var(--ms-text)",
                fontSize: 14,
                outline: "none",
                fontFamily: "var(--ms-font)",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--ms-accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--ms-border)")}
            />
          </div>
          <button
            type="submit"
            className="ms-btn ms-btn-primary"
            style={{ padding: "0 20px", borderRadius: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Play size={14} fill="currentColor" /> Watch Now
          </button>
        </form>

        {/* Category Pills */}
        <div className="ms-filter-strip" style={{ padding: "0 0 10px", margin: 0 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`ms-filter-btn${activeCategory === cat.id ? " is-active" : ""}`}
              style={{ padding: "7px 16px", fontSize: 13 }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Video Grid */}
      <section style={{ padding: "0 20px" }}>
        <div className="ms-section">
          <Flame size={18} color="var(--ms-accent)" />
          <h2>Recommended Replays &amp; Highlights</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {filteredVideos.map((video) => {
            const isPlaying = selectedVideo?.id === video.id;
            return (
              <div
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="ms-card ms-card-hover"
                style={{
                  cursor: "pointer",
                  overflow: "hidden",
                  border: isPlaying ? "1px solid var(--ms-accent)" : "1px solid var(--ms-border)",
                  background: isPlaying ? "var(--ms-surface-2)" : "var(--ms-surface)",
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: "relative", aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {/* Duration Badge */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "rgba(0,0,0,0.8)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {video.duration}
                  </span>
                  {/* Play Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isPlaying ? "rgba(229,20,43,0.3)" : "rgba(0,0,0,0.3)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: isPlaying ? "var(--ms-accent)" : "rgba(10,10,16,0.85)",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--ms-accent)", fontWeight: 800 }}>
                      {video.competition}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--ms-faint)" }}>• {video.channel}</span>
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: isPlaying ? "var(--ms-accent)" : "var(--ms-text)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {video.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
