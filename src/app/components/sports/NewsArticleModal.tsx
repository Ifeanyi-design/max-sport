import { useEffect } from "react";
import { X, Share2, Calendar, Newspaper, ExternalLink, ArrowRight } from "lucide-react";

export interface NewsArticle {
  id: number;
  tag: string;
  title: string;
  time: string;
  source: string;
  img: string;
  paragraphs: string[];
  author?: string;
  readTime?: string;
}

interface Props {
  article: NewsArticle | null;
  onClose: () => void;
  onOpenHighlights?: () => void;
}

export function NewsArticleModal({ article, onClose, onOpenHighlights }: Props) {
  useEffect(() => {
    if (!article) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [article, onClose]);

  if (!article) return null;

  const handleShare = () => {
    if (navigator.share) {
      void navigator.share({
        title: article.title,
        text: article.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      void navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-article-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(3, 7, 12, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          background: "#0d1520",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.85)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          animation: "msFadeUp 0.2s ease-out",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: "14px 18px",
            background: "#12202e",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Newspaper size={16} color="var(--ms-accent)" />
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--ms-text)", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.02em" }}>
              MAXSPORT EDITORIAL
            </span>
            <span style={{ fontSize: 11, color: "var(--ms-muted)" }}>•</span>
            <span style={{ fontSize: 11, color: "var(--ms-muted)" }}>{article.readTime || "3 min read"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share article"
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: "rgba(255, 255, 255, 0.06)", border: "none",
                color: "var(--ms-text)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Share2 size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close article"
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: "rgba(255, 255, 255, 0.06)", border: "none",
                color: "var(--ms-text)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Article Body Content */}
        <div
          className="ms-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 0 24px",
          }}
        >
          {/* Cover image */}
          <div
            style={{
              width: "100%",
              height: 240,
              backgroundImage: `url('${article.img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(13,21,32,0.1) 0%, rgba(13,21,32,0.85) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 18,
                right: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  background: "var(--ms-accent)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                  padding: "3px 8px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                }}
              >
                {article.tag}
              </span>
              <span style={{ fontSize: 11, color: "var(--ms-text-2)", fontWeight: 600 }}>
                {article.source} · {article.time}
              </span>
            </div>
          </div>

          {/* Article Text */}
          <div style={{ padding: "18px 20px 0" }}>
            <h1
              id="news-article-title"
              style={{
                margin: "0 0 14px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(22px, 4vw, 28px)",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
              }}
            >
              {article.title}
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {article.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: idx === 0 ? "var(--ms-text)" : "var(--ms-text-2)",
                    fontWeight: idx === 0 ? 550 : 400,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Related Actions */}
            <div
              style={{
                marginTop: 24,
                padding: "16px",
                background: "var(--ms-surface-2)",
                borderRadius: 10,
                border: "1px solid var(--ms-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                  Want to watch the action?
                </div>
                <div style={{ fontSize: 11, color: "var(--ms-muted)", marginTop: 2 }}>
                  Stream live match broadcasts and all video replays.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHighlights?.();
                }}
                className="ms-btn ms-btn-primary"
                style={{ padding: "8px 16px", fontSize: 12 }}
              >
                Watch Highlights <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
