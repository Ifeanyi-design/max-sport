import { useEffect } from "react";
import { X, Play, Sparkles, ExternalLink, Film } from "lucide-react";

export interface VideoItem {
  id: string;
  title: string;
  comp?: string;
  competition?: string;
  time?: string;
  duration?: string;
  channel?: string;
}

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onSelectVideo?: (v: VideoItem) => void;
  relatedVideos?: VideoItem[];
  onOpenHighlightsHub?: () => void;
}

export function VideoPlayerModal({
  video,
  onClose,
  onSelectVideo,
  relatedVideos = [],
  onOpenHighlightsHub,
}: VideoPlayerModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (video) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  if (!video) return null;

  const compName = video.competition || video.comp || "Football Match";
  const duration = video.duration || video.time || "Highlights";

  return (
    <div
      onClick={onClose}
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
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#0d0d16",
          borderRadius: 18,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.9)",
          display: "flex",
          flexDirection: "column",
        }}
        className="ms-scroll"
      >
        {/* Top bar with title and close */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span
              style={{
                background: "var(--ms-accent)",
                color: "#fff",
                padding: "3px 8px",
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.06em",
              }}
            >
              {compName}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--ms-text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {video.title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ms-icon-btn"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 16:9 Video Player Screen */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </div>

        {/* Video info & Actions */}
        <div style={{ padding: "16px 20px", background: "var(--ms-surface)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(15px, 2.5vw, 19px)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {video.title}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 12, color: "var(--ms-muted)" }}>
                <span>{video.channel || "Official Match Highlights"}</span>
                <span>•</span>
                <span>{duration}</span>
              </div>
            </div>

            {onOpenHighlightsHub && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHighlightsHub();
                }}
                className="ms-btn ms-btn-primary"
                style={{ fontSize: 12, padding: "8px 16px", borderRadius: 10 }}
              >
                <Film size={13} /> More Match Replays
              </button>
            )}
          </div>
        </div>

        {/* Related / Next Clips Carousel inside modal */}
        {relatedVideos.length > 0 && (
          <div style={{ padding: "14px 20px 18px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 800, color: "var(--ms-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Sparkles size={12} color="var(--ms-accent)" />
              Next Recommended Replays
            </div>
            <div
              className="ms-scroll"
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                paddingBottom: 4,
              }}
            >
              {relatedVideos
                .filter((r) => r.id !== video.id)
                .slice(0, 6)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectVideo && onSelectVideo(item)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "var(--ms-surface)",
                      border: "1px solid var(--ms-border)",
                      color: "var(--ms-text)",
                      cursor: "pointer",
                      textAlign: "left",
                      minWidth: 220,
                      maxWidth: 260,
                      flexShrink: 0,
                    }}
                    className="ms-card-hover"
                  >
                    <div style={{ position: "relative", width: 68, aspectRatio: "16/9", borderRadius: 6, overflow: "hidden", background: "#000", flexShrink: 0 }}>
                      <img
                        src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.3)" }}>
                        <Play size={10} fill="#fff" color="#fff" />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: 1.25,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--ms-muted)" }}>
                        {item.competition || item.comp || "Match"}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
