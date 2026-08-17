import { useEffect, useState } from "react";
import { Youtube, ExternalLink, Video, RefreshCw, Film } from "lucide-react";
import { getHighlights, type ApiHighlight } from "./api";
import type { Screen } from "./types";
import { PageHeader } from "./PageHeader";

interface Props {
  setActiveScreen: (s: Screen) => void;
}

/**
 * Extract a YouTube video ID from a variety of URL formats.
 * Returns null if the URL is not a YouTube link.
 */
function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0] || null;
      }
      return u.searchParams.get("v");
    }
    if (u.hostname === "youtu.be") {
      return u.pathname.slice(1).split(/[/?#]/)[0] || null;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

const YT_THUMB = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
const YT_WATCH = (id: string) =>
  `https://www.youtube.com/watch?v=${id}`;
const YT_EMBED = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

// Search YouTube for football highlights — fall back to YouTube Data API suggestion
function buildYouTubeSearchUrl(q: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

interface VideoCard {
  id: string;          // YouTube video ID
  title: string;
  source: "api" | "youtube-search";
  url?: string;        // original URL from API if present
}

export function HighlightsPage({ setActiveScreen }: Props) {
  const [apiData, setApiData] = useState<ApiHighlight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [embedId, setEmbedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true); setError(null);
    getHighlights()
      .then(data => setApiData(data))
      .catch(e => {
        // Even if API fails, show YouTube search option
        setApiData([]);
        setError(String(e?.message || e));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Build video cards from API data (only YouTube links)
  const videoCards: VideoCard[] = [];
  if (apiData) {
    for (const h of apiData) {
      const url = (h as any).url || (h as any).video_url || "";
      if (!url) continue;
      const ytId = extractYouTubeId(url);
      if (ytId) {
        videoCards.push({ id: ytId, title: h.title || h.competition || "Highlights", source: "api", url });
      }
    }
  }

  const hasVideos = videoCards.length > 0;

  // Popular YouTube highlight channels to suggest
  const CHANNELS = [
    { name: "Champions League", q: "UEFA Champions League highlights", emoji: "⭐" },
    { name: "Premier League", q: "Premier League highlights 2025", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "La Liga", q: "La Liga highlights 2025", emoji: "🇪🇸" },
    { name: "Bundesliga", q: "Bundesliga highlights 2025", emoji: "🇩🇪" },
    { name: "Serie A", q: "Serie A highlights 2025", emoji: "🇮🇹" },
    { name: "Ligue 1", q: "Ligue 1 highlights 2025", emoji: "🇫🇷" },
  ];

  return (
    <div style={{ minHeight: "100%", paddingBottom: 48 }}>
      <PageHeader title="Highlights" onBack={() => setActiveScreen("home")} onRefresh={load} />

      {/* Embed modal */}
      {embedId && (
        <div
          onClick={() => setEmbedId(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 860,
              borderRadius: 12, overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
              background: "#000",
            }}
          >
            <iframe
              src={YT_EMBED(embedId)}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ display: "block", width: "100%", aspectRatio: "16/9", border: "none" }}
            />
            <div style={{ padding: "10px 14px", textAlign: "right" }}>
              <button
                onClick={() => setEmbedId(null)}
                className="ms-btn"
                style={{ fontSize: 12 }}
              >
                Close
              </button>
              <a
                href={YT_WATCH(embedId)}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-btn"
                style={{ marginLeft: 8, fontSize: 12, textDecoration: "none" }}
              >
                Open on YouTube <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* YouTube search bar */}
      <div style={{ padding: "0 14px 16px" }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            const q = search.trim();
            if (q) window.open(buildYouTubeSearchUrl(q + " football highlights"), "_blank", "noopener");
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <div style={{ flex: 1, position: "relative" }}>
            <Youtube size={15} color="var(--ms-live)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search football highlights on YouTube…"
              style={{
                width: "100%", padding: "10px 12px 10px 34px",
                background: "var(--ms-surface-2)", border: "1px solid var(--ms-border)",
                borderRadius: 10, color: "var(--ms-text)", fontSize: 13,
                outline: "none", fontFamily: "var(--ms-font)",
                transition: "border-color 0.14s ease",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--ms-accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--ms-border)")}
            />
          </div>
          <button type="submit" className="ms-btn ms-btn-primary" style={{ flexShrink: 0 }}>
            <Youtube size={14} /> Search
          </button>
        </form>
      </div>

      {/* API video grid */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, padding: "0 14px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ms-skeleton" style={{ aspectRatio: "16/9", borderRadius: 10 }} />
          ))}
        </div>
      )}

      {!loading && hasVideos && (
        <section style={{ padding: "0 14px 24px" }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 16, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}>
            Latest Highlights
          </h2>
          <div className="ms-video-grid">
            {videoCards.map(v => (
              <VideoThumbnailCard key={v.id} video={v} onEmbed={() => setEmbedId(v.id)} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state / fallback */}
      {!loading && !hasVideos && (
        <section style={{ padding: "0 14px 24px" }}>
          <div style={{
            textAlign: "center", padding: "32px 24px",
            background: "var(--ms-surface)", border: "1px solid var(--ms-border)",
            borderRadius: 14, marginBottom: 24,
          }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🎬</p>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>No highlights available right now</p>
            <p style={{ color: "var(--ms-muted)", fontSize: 13, margin: "0 0 16px", lineHeight: 1.6 }}>
              Highlights come from the API. Use the search bar above to find videos on YouTube, or click a league below.
            </p>
          </div>
        </section>
      )}

      {/* Quick links to YouTube channels */}
      <section style={{ padding: "0 14px" }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 15, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, color: "var(--ms-muted)" }}>
          Quick search on YouTube
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
          {CHANNELS.map(ch => (
            <a
              key={ch.q}
              href={buildYouTubeSearchUrl(ch.q)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
                background: "var(--ms-surface)", border: "1px solid var(--ms-border)",
                borderRadius: 10, textDecoration: "none", color: "var(--ms-text)",
                fontSize: 13, fontWeight: 700, transition: "border-color 0.14s ease, background 0.14s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--ms-border-strong)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--ms-surface-2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--ms-border)";
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--ms-surface)";
              }}
            >
              <span style={{ fontSize: 18 }}>{ch.emoji}</span>
              <span>{ch.name}</span>
              <ExternalLink size={11} color="var(--ms-faint)" style={{ marginLeft: "auto", flexShrink: 0 }} />
            </a>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 10, background: "var(--ms-surface)", border: "1px solid var(--ms-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <Youtube size={20} color="#ff0000" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>
              <a href="https://www.youtube.com/@PremierLeague" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ms-text)", textDecoration: "none" }}>
                Premier League Official Channel
              </a>
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--ms-muted)" }}>
              Best official source for match highlights
            </p>
          </div>
          <a
            href="https://www.youtube.com/@PremierLeague"
            target="_blank"
            rel="noopener noreferrer"
            className="ms-btn"
            style={{ flexShrink: 0, fontSize: 11, textDecoration: "none" }}
          >
            Visit
          </a>
        </div>
      </section>
    </div>
  );
}

function VideoThumbnailCard({ video, onEmbed }: { video: VideoCard; onEmbed: () => void }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = thumbFailed
    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
    : YT_THUMB(video.id);

  return (
    <div
      style={{
        borderRadius: 10, overflow: "hidden",
        background: "var(--ms-surface)", border: "1px solid var(--ms-border)",
        cursor: "pointer", transition: "transform 0.14s ease, box-shadow 0.14s ease",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--ms-shadow-sm)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
      onClick={onEmbed}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#000", overflow: "hidden" }}>
        <img
          src={thumb}
          alt={video.title}
          onError={() => setThumbFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* Play button overlay */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.25)", transition: "background 0.14s ease",
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "rgba(229,20,43,0.9)", display: "grid", placeItems: "center",
            boxShadow: "0 4px 14px rgba(229,20,43,0.45)",
          }}>
            <Film size={18} color="#fff" fill="white" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px" }}>
        <p style={{
          margin: 0, fontWeight: 700, fontSize: 13, lineHeight: 1.35,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {video.title}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <Youtube size={12} color="#ff0000" />
          <span style={{ fontSize: 11, color: "var(--ms-muted)" }}>YouTube</span>
          <a
            href={YT_WATCH(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, color: "var(--ms-muted)", fontSize: 11, textDecoration: "none" }}
          >
            <ExternalLink size={10} /> Open
          </a>
        </div>
      </div>
    </div>
  );
}
