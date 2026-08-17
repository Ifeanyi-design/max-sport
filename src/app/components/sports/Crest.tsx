import { useEffect, useRef, useState } from "react";
import { colorFromString } from "./api";
import { getCountryFlagUrl } from "./flags";
import { getClubDictionaryLogo } from "./clubLogos";

interface CrestProps {
  /** Preferred logo URL (from DB). May be null. */
  src?: string | null;
  /** Extra CDN fallback URLs to try if src fails or is null. */
  fallbackSrcs?: string[];
  name?: string | null;
  abbr?: string | null;
  size?: number;
  radius?: number | "circle";
  /** Explicit background color; derived from name if omitted */
  bgColor?: string;
  country?: string | null;
}

function darken(hex: string, amount = 0.55): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.floor(((n >> 16) & 255) * (1 - amount));
  const g = Math.floor(((n >> 8) & 255) * (1 - amount));
  const b = Math.floor((n & 255) * (1 - amount));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function Crest({ src, fallbackSrcs = [], name, abbr, size = 28, radius, bgColor, country }: CrestProps) {
  // 1. Direct dictionary logo for world football clubs
  const dictLogo = getClubDictionaryLogo(name);

  // 2. Check if name is a known country (National team)
  const countryFlagUrl = getCountryFlagUrl(name || country, size > 32 ? 80 : 40);

  const allSrcs = [
    src,
    dictLogo,
    ...fallbackSrcs,
    countryFlagUrl,
  ].filter(Boolean) as string[];


  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  // Reset when logo sources change
  const keyRef = useRef(allSrcs.join("|"));
  useEffect(() => {
    const key = allSrcs.join("|");
    if (key !== keyRef.current) {
      keyRef.current = key;
      setIdx(0);
      setFailed(false);
    }
  });

  const label = (
    abbr ||
    (name || "?")
      .replace(/[^A-Za-z0-9]/g, " ")
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 3) ||
    "?"
  ).toUpperCase();

  const currentSrc = allSrcs[idx];
  const showImg = Boolean(currentSrc) && !failed;

  const baseName = name || label;
  const derivedColor = bgColor || colorFromString(baseName);
  const derivedDark = darken(derivedColor, 0.6);

  // Border radius
  const r =
    radius === "circle"
      ? "50%"
      : radius !== undefined
      ? radius
      : size > 40
      ? 10
      : 7;

  const fontSize = Math.max(8, Math.round(size * 0.32));

  return (
    <span
      title={name || undefined}
      className={`ms-crest${radius === "circle" ? " ms-crest-round" : ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: showImg ? "rgba(255,255,255,0.06)" : `linear-gradient(145deg, ${derivedColor}, ${derivedDark})`,
        border: showImg ? "1px solid rgba(255,255,255,0.12)" : `1px solid rgba(255,255,255,0.25)`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
      }}
    >
      {showImg ? (
        <img
          src={currentSrc}
          alt={name || ""}
          onError={() => {
            if (idx + 1 < allSrcs.length) {
              setIdx(idx + 1);
            } else {
              setFailed(true);
            }
          }}
          className="ms-crest-img"
          style={{ width: "88%", height: "88%", objectFit: "contain" }}
        />
      ) : (
        <span
          className="ms-crest-fallback"
          style={{
            fontSize,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          {label.slice(0, size < 24 ? 2 : 3)}
        </span>
      )}
    </span>
  );
}
