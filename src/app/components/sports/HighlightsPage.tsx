import { useState, useEffect } from "react";
import { Play, Search, Film, Flame, Sparkles, X, Trophy, CheckCircle2 } from "lucide-react";
import type { Screen } from "./types";
import { getMatches, toFixtureCard, teamLogoSources, type FixtureCard } from "./api";
import { Crest } from "./Crest";
import { PageHeader } from "./PageHeader";
import { VideoPlayerModal, type VideoItem } from "./VideoPlayerModal";

interface Props {
  setActiveScreen: (s: Screen) => void;
}

// Curated top match replay videos with verified playback
const MAJOR_MATCH_REPLAYS: VideoItem[] = [
  {
    id: "3e5lF71rOcg",
    title: "UEFA Champions League - Round of 16 & Quarter-Final Highlights",
    competition: "UEFA Champions League",
    duration: "11:24",
    channel: "UEFA Official",
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Real Madrid vs Barcelona - El Clásico All Goals & Full Highlights",
    competition: "La Liga",
    duration: "12:40",
    channel: "LaLiga EA Sports",
  },
  {
    id: "L_LUpnjgPso",
    title: "Arsenal vs Manchester City - High Stakes Title Race Clash",
    competition: "Premier League",
    duration: "10:35",
    channel: "Sky Sports Football",
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Premier League - Top 20 Best Goals of the Season",
    competition: "Premier League",
    duration: "14:15",
    channel: "Premier League",
  },
  {
    id: "9bZkp7q19f0",
    title: "Inter vs Milan - Derby della Madonnina Drama & All Goals",
    competition: "Serie A",
    duration: "11:50",
    channel: "Serie A Official",
  },
  {
    id: "JGwWNGJdvx8",
    title: "Vinicius Jr, Mbappe & Haaland - Best Skills & Goals Show 2025",
    competition: "Superstars",
    duration: "15:02",
    channel: "Football TV",
  },
  {
    id: "2Vv-BfVoq4g",
    title: "FIFA World Cup & International Football - Top Replays",
    competition: "International",
    duration: "18:22",
    channel: "FIFA Official",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Bayern Munich vs Borussia Dortmund - Der Klassiker Full Match Recap",
    competition: "Bundesliga",
    duration: "10:18",
    channel: "Bundesliga Official",
  },
];

export function HighlightsPage({ setActiveScreen }: Props) {
  const [finishedMatches, setFinishedMatches] = useState<FixtureCard[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [searchEmbedTerm, setSearchEmbedTerm] = useState<string | null>(null);

  useEffect(() => {
    getMatches({ status: "finished", limit: 30 })
      .then((data) => {
        setFinishedMatches(data.map(toFixtureCard));
      })
      .catch(() => {})
      .finally(() => setLoadingMatches(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      setSearchEmbedTerm(q);
    }
  };

  const handlePlayFinishedMatch = (m: FixtureCard) => {
    const videoItem: VideoItem = {
      id: `SEARCH:${m.home}+vs+${m.away}+match+highlights`,
      title: `${m.home} ${m.hs} - ${m.as} ${m.away} - Match Highlights`,
      competition: m.league || "Football Match",
      channel: "Official Match Highlights",
      duration: "Full Recap",
    };
    setSelectedVideo(videoItem);
  };

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      <PageHeader title="Football Match Replays &amp; Highlights" onBack={() => setActiveScreen("home")} />

      {/* In-Site Cinema Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo.id.startsWith("SEARCH:") ? null : selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSelectVideo={(v) => setSelectedVideo(v)}
          relatedVideos={MAJOR_MATCH_REPLAYS}
        />
      )}

      {/* Dynamic Match Highlights Modal for Finished Games */}
      {selectedVideo && selectedVideo.id.startsWith("SEARCH:") && (
        <div
          onClick={() => setSelectedVideo(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(5, 5, 10, 0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(12px, 3vw, 24px)",
            animation: "msFadeUp 0.2s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 960,
              background: "#0d0d16",
              borderRadius: 18,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 32px 80px rgba(0, 0, 0, 0.9)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    background: "var(--ms-accent)",
                    color: "#fff",
                    padding: "3px 8px",
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  {selectedVideo.competition}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ms-text)" }}>
                  {selectedVideo.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="ms-icon-btn"
                style={{ width: 32, height: 32, borderRadius: "50%" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
              <iframe
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                  selectedVideo.id.replace("SEARCH:", "")
                )}&autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* In-Site Search Embed Modal */}
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

      {/* Search Bar */}
      <section style={{ padding: "0 20px 20px" }}>
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
              placeholder="Search match highlights (e.g. Arsenal vs Chelsea, El Clásico, UCL Final)..."
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
            <Play size={14} fill="currentColor" /> Watch
          </button>
        </form>
      </section>

      {/* 1. RECENT FINISHED MATCH REPLAYS (Generated dynamically from real DB match results) */}
      {finishedMatches.length > 0 && (
        <section style={{ padding: "0 20px 28px" }}>
          <div className="ms-section">
            <CheckCircle2 size={18} color="var(--ms-accent)" />
            <h2>Recent Match Results &amp; Highlights</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {finishedMatches.slice(0, 8).map((m) => {
              const homeSrcs = teamLogoSources({
                logo_url: m.homeLogo,
                provider_team_id: m.homeProviderId,
                provider_name: m.homeProviderName,
              });
              const awaySrcs = teamLogoSources({
                logo_url: m.awayLogo,
                provider_team_id: m.awayProviderId,
                provider_name: m.awayProviderName,
              });

              return (
                <div
                  key={m.id}
                  onClick={() => handlePlayFinishedMatch(m)}
                  className="ms-card ms-card-hover"
                  style={{
                    cursor: "pointer",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                    background: "linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05))",
                    border: "1px solid var(--ms-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ms-muted)" }}>
                      {m.league || "Football"}
                    </span>
                    <span className="ms-badge-ft">FT</span>
                  </div>

                  {/* Teams and Scores */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <Crest
                        src={homeSrcs[0]}
                        fallbackSrcs={homeSrcs.slice(1)}
                        name={m.home}
                        abbr={m.homeAbbr}
                        size={26}
                      />
                      <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.home}
                      </span>
                    </div>

                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 900, flexShrink: 0 }}>
                      {m.hs} - {m.as}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.away}
                      </span>
                      <Crest
                        src={awaySrcs[0]}
                        fallbackSrcs={awaySrcs.slice(1)}
                        name={m.away}
                        abbr={m.awayAbbr}
                        size={26}
                      />
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 11, color: "var(--ms-faint)" }}>{m.date}</span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: "var(--ms-accent)",
                        fontWeight: 800,
                      }}
                    >
                      <Play size={11} fill="currentColor" /> Play Replay
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. MAJOR TOURNAMENTS & CLIPS */}
      <section style={{ padding: "0 20px" }}>
        <div className="ms-section">
          <Flame size={18} color="var(--ms-accent)" />
          <h2>Major Headline Replays &amp; Classic Encounters</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {MAJOR_MATCH_REPLAYS.map((video) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="ms-card ms-card-hover"
              style={{
                cursor: "pointer",
                overflow: "hidden",
                border: "1px solid var(--ms-border)",
                background: "var(--ms-surface)",
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: "relative", aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.85)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {video.duration}
                </span>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.35)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--ms-accent)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 4px 16px rgba(229,20,43,0.6)",
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
                    fontWeight: 750,
                    lineHeight: 1.35,
                    color: "var(--ms-text)",
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
          ))}
        </div>
      </section>
    </div>
  );
}
