import { useState, useRef, useEffect } from "react";
import { getCountryFlagSources } from "./flags";
import { Globe } from "lucide-react";

interface FlagIconProps {
  country?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FlagIcon({ country, size = 16, className, style }: FlagIconProps) {
  const sources = getCountryFlagSources(country);
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const keyRef = useRef(sources.join("|"));
  useEffect(() => {
    const key = sources.join("|");
    if (key !== keyRef.current) {
      keyRef.current = key;
      setIdx(0);
      setFailed(false);
    }
  }, [sources]);

  if (!sources.length || failed) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: Math.round(size * 0.72),
          borderRadius: 2.5,
          background: "rgba(255,255,255,0.08)",
          color: "var(--ms-muted)",
          ...style,
        }}
        className={className}
      >
        <Globe size={Math.round(size * 0.65)} />
      </span>
    );
  }

  const currentSrc = sources[idx];

  return (
    <img
      src={currentSrc}
      alt={country || "Flag"}
      onError={() => {
        if (idx + 1 < sources.length) {
          setIdx(idx + 1);
        } else {
          setFailed(true);
        }
      }}
      style={{
        width: size,
        height: Math.round(size * 0.72),
        objectFit: "cover",
        borderRadius: 2.5,
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.14)",
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      className={className}
    />
  );
}
