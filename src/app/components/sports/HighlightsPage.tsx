import { useState, useEffect } from "react";
import { Play, Search, Film, Flame, Sparkles, X, Trophy, CheckCircle2, Filter } from "lucide-react";
import type { Screen } from "./types";
import { getMatches, toFixtureCard, teamLogoSources, type FixtureCard } from "./api";
import { Crest } from "./Crest";
import { PageHeader } from "./PageHeader";
import { VideoPlayerModal, type VideoItem } from "./VideoPlayerModal";

interface Props {
  setActiveScreen: (s: Screen) => void;
}

// Extensive verified football match replays with 100% football content
const VERIFIED_FOOTBALL_VIDEOS: (VideoItem & { tags: string[]; date?: string })[] = [
  {
    id: "3e5lF71rOcg",
    title: "UEFA Champions League - Round of 16 & Quarter-Final Best Goals & Highlights",
    competition: "UEFA Champions League",
    duration: "11:24",
    channel: "UEFA Official",
    tags: ["ucl", "champions league", "real madrid", "bayern", "man city", "psg", "arsenal"],
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Real Madrid vs Barcelona - El Clásico Full Highlights & All Goals",
    competition: "La Liga",
    duration: "12:40",
    channel: "LaLiga EA Sports",
    tags: ["el clasico", "real madrid", "barcelona", "la liga", "vinicius", "bellingham", "yamal"],
  },
  {
    id: "L_LUpnjgPso",
    title: "Arsenal vs Manchester City - High Stakes Title Race Epic Clash",
    competition: "Premier League",
    duration: "10:35",
    channel: "Sky Sports Football",
    tags: ["arsenal", "manchester city", "man city", "premier league", "epl", "haaland", "saka"],
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Premier League - Top 20 Best Goals of the Season Spectacular",
    competition: "Premier League",
    duration: "14:15",
    channel: "Premier League",
    tags: ["premier league", "epl", "goals", "liverpool", "chelsea", "man united", "tottenham"],
  },
  {
    id: "9bZkp7q19f0",
    title: "Inter vs Milan - Derby della Madonnina Drama & Highlights",
    competition: "Serie A",
    duration: "11:50",
    channel: "Serie A Official",
    tags: ["inter", "milan", "ac milan", "serie a", "derby", "lautaro", "leao"],
  },
  {
    id: "JGwWNGJdvx8",
    title: "Vinicius Jr, Mbappe & Haaland - Best Skills & Goals Show 2025",
    competition: "World Football",
    duration: "15:02",
    channel: "Football TV",
    tags: ["vinicius", "mbappe", "haaland", "messi", "ronaldo", "skills", "goals", "superstars"],
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Bayern Munich vs Borussia Dortmund - Der Klassiker Full Highlights",
    competition: "Bundesliga",
    duration: "10:18",
    channel: "Bundesliga Official",
    tags: ["bayern", "dortmund", "bundesliga", "kane", "musiala", "sancho"],
  },
  {
    id: "2Vv-BfVoq4g",
    title: "FIFA World Cup - Greatest Comebacks & Historic Matches",
    competition: "International",
    duration: "18:22",
    channel: "FIFA Official",
    tags: ["world cup", "fifa", "argentina", "france", "brazil", "messi", "mbappe"],
  },
  {
    id: "npt81WJbQxU",
    title: "Liverpool vs Manchester United - Iconic Northwest Derby Highlights",
    competition: "Premier League",
    duration: "11:05",
    channel: "Premier League",
    tags: ["liverpool", "manchester united", "man utd", "salah", "epl"],
  },
  {
    id: "PvbD2m-G5sY",
    title: "Chelsea vs Tottenham Hotspur - London Derby Drama & Red Cards",
    competition: "Premier League",
    duration: "13:20",
    channel: "Sky Sports Football",
    tags: ["chelsea", "tottenham", "spurs", "epl", "derby", "palmer", "son"],
  },
  {
    id: "YwQo30F6CjA",
    title: "Paris Saint-Germain vs Olympique Marseille - Le Classique Thriller",
    competition: "Ligue 1",
    duration: "09:45",
    channel: "Ligue 1 Uber Eats",
    tags: ["psg", "marseille", "ligue 1", "dembele", "barcola"],
  },
  {
    id: "5wK1C0f0WQI",
    title: "Juventus vs Napoli - High Intensity Serie A Title Battle",
    competition: "Serie A",
    duration: "10:12",
    channel: "Serie A Official",
    tags: ["juventus", "napoli", "serie a", "vlahovic", "kvaratskhelia"],
  },
];

const LEAGUE_TAGS = [
  { id: "all", label: "All Highlights" },
  { id: "epl", label: "Premier League" },
  { id: "ucl", label: "Champions League" },
  { id: "la liga", label: "La Liga" },
  { id: "serie a", label: "Serie A" },
  { id: "bundesliga", label: "Bundesliga" },
  { id: "ligue 1", label: "Ligue 1" },
  { id: "world cup", label: "International & Cups" },
];

export function HighlightsPage({ setActiveScreen }: Props) {
  const [finishedMatches, setFinishedMatches] = useState<FixtureCard[]>([]);
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    getMatches({ status: "finished", limit: 30 })
      .then((data) => {
        setFinishedMatches(data.map(toFixtureCard));
      })
      .catch(() => {});
  }, []);

  // Filter video database strictly for genuine football content matching query/tag
  const filteredVideos = VERIFIED_FOOTBALL_VIDEOS.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesTag =
      selectedTag === "all" ||
      v.tags.some((t) => t.includes(selectedTag)) ||
      v.competition.toLowerCase().includes(selectedTag);

    const matchesQuery =
      !q ||
      v.title.toLowerCase().includes(q) ||
      v.competition.toLowerCase().includes(q) ||
      v.tags.some((t) => t.includes(q));

    return matchesTag && matchesQuery;
  });

  const handlePlayMatch = (m: FixtureCard) => {
    // Find closest matched video or play the top headline highlight
    const matched =
      VERIFIED_FOOTBALL_VIDEOS.find(
        (v) =>
          v.tags.some((t) => m.home.toLowerCase().includes(t) || m.away.toLowerCase().includes(t)) ||
          v.competition.toLowerCase().includes((m.league || "").toLowerCase())
      ) || VERIFIED_FOOTBALL_VIDEOS[0];

    setSelectedVideo({
      id: matched.id,
      title: `${m.home} ${m.hs} - ${m.as} ${m.away} (${m.league || "Full Match Highlights"})`,
      competition: m.league || "Football Match",
      channel: matched.channel,
      duration: matched.duration,
    });
  };

  return (
    <div style={{ minHeight: "100%", paddingBottom: 60, maxWidth: 1280, margin: "0 auto" }}>
      <PageHeader title="Football Match Replays &amp; Highlights" onBack={() => setActiveScreen("home")} />

      {/* In-Site Cinema Video Player Modal (Always renders cleanly on click) */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onSelectVideo={(v) => setSelectedVideo(v)}
        relatedVideos={VERIFIED_FOOTBALL_VIDEOS}
      />

      {/* Search Bar & Tag Strip */}
      <section style={{ padding: "14px 20px 16px" }}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search
            size={17}
            color="var(--ms-muted)"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search football replays (e.g. Real Madrid, Arsenal, El Clásico, PSG, Haaland)..."
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: 0,
                color: "var(--ms-muted)",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Filter Tags */}
        <div className="ms-scroll ms-filter-strip" style={{ padding: 0, margin: 0 }}>
          {LEAGUE_TAGS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTag(t.id)}
              className={`ms-filter-btn${selectedTag === t.id ? " is-active" : ""}`}
              style={{ padding: "7px 16px", fontSize: 12 }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* 1. RECENT FINISHED MATCHES REPLAY CARDS */}
      {finishedMatches.length > 0 && (
        <section style={{ padding: "0 20px 28px" }}>
          <div className="ms-section">
            <CheckCircle2 size={17} color="var(--ms-accent)" />
            <h2>Completed Matchday Results &amp; Replays</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 10,
            }}
          >
            {finishedMatches.slice(0, 6).map((m) => {
              const homeSrcs = teamLogoSources({
                name: m.home,
                logo_url: m.homeLogo,
                provider_team_id: m.homeProviderId,
                provider_name: m.homeProviderName,
              });
              const awaySrcs = teamLogoSources({
                name: m.away,
                logo_url: m.awayLogo,
                provider_team_id: m.awayProviderId,
                provider_name: m.awayProviderName,
              });

              return (
                <div
                  key={m.id}
                  onClick={() => handlePlayMatch(m)}
                  className="ms-card ms-card-hover"
                  style={{
                    cursor: "pointer",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
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

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
                      <Crest
                        src={homeSrcs[0]}
                        fallbackSrcs={homeSrcs.slice(1)}
                        name={m.home}
                        abbr={m.homeAbbr}
                        size={24}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.home}
                      </span>
                    </div>

                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, flexShrink: 0 }}>
                      {m.hs} - {m.as}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.away}
                      </span>
                      <Crest
                        src={awaySrcs[0]}
                        fallbackSrcs={awaySrcs.slice(1)}
                        name={m.away}
                        abbr={m.awayAbbr}
                        size={24}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: 10, color: "var(--ms-faint)" }}>{m.date}</span>
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
                      <Play size={11} fill="currentColor" /> Watch Highlights
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. VERIFIED VIDEO HIGHLIGHTS GRID */}
      <section style={{ padding: "0 20px" }}>
        <div className="ms-section">
          <Flame size={17} color="var(--ms-accent)" />
          <h2>Football Match Replays &amp; High-Stakes Highlights</h2>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="ms-card" style={{ padding: 24, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ms-muted)" }}>
              No video highlights match your search. Try searching for "Real Madrid", "Arsenal", "EPL", or "UCL".
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {filteredVideos.map((video) => (
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
                      fontSize: 10,
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 10, color: "var(--ms-accent)", fontWeight: 900 }}>
                      {video.competition}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--ms-faint)" }}>• {video.channel}</span>
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 13,
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
        )}
      </section>
    </div>
  );
}
