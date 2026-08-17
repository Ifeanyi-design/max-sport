import { useEffect, useState } from "react";

interface CrestProps {
  src?: string | null;
  name?: string | null;
  abbr?: string | null;
  size?: number;
}

export function Crest({ src, name, abbr, size = 28 }: CrestProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const label = (abbr || (name || "?").replace(/[^A-Za-z0-9]/g, " ").trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 3) || "?").toUpperCase();
  const showImg = Boolean(src) && !failed;

  return (
    <span
      title={name || undefined}
      style={{
        width: size,
        height: size,
        borderRadius: size > 40 ? 10 : 6,
        background: showImg ? "#ffffff" : "#1c1c26",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {showImg ? (
        <img
          src={src as string}
          alt={name || ""}
          onError={() => setFailed(true)}
          style={{ width: "80%", height: "80%", objectFit: "contain" }}
        />
      ) : (
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: Math.max(8, Math.round(size * 0.32)),
            fontWeight: 800,
            color: "#c8c8d4",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {label.slice(0, 3)}
        </span>
      )}
    </span>
  );
}
