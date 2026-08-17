import { useState } from "react";
import { getCountryFlagUrl } from "./flags";
import { Globe } from "lucide-react";

interface FlagIconProps {
  country?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function FlagIcon({ country, size = 16, className, style }: FlagIconProps) {
  const [failed, setFailed] = useState(false);
  const flagUrl = getCountryFlagUrl(country, size > 24 ? 80 : 40);

  if (!flagUrl || failed) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: Math.round(size * 0.75),
          borderRadius: 3,
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

  return (
    <img
      src={flagUrl}
      alt={country || "Country"}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: Math.round(size * 0.72),
        objectFit: "cover",
        borderRadius: 2.5,
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.12)",
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
      className={className}
    />
  );
}
